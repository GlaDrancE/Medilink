import requests
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import time
import json
from model import detect_anomaly  # Import anomaly detection function
import threading
import wifi_utils  # Import Wi-Fi utility functions
import email_utils  # Import email utility functions

app = Flask(__name__)

JS_API_BASE_URL = "http://localhost:4000/api/logs"

# Dictionary to store monitoring threads for each user
monitoring_threads = {}

def monitor_wifi_connection(user_email, user_mac_address, stop_event):
    """
    Continuously monitor the Wi-Fi connection of a device.
    Send an email only once when the device disconnects.
    Resume monitoring if the device reconnects.
    Stop monitoring when the stop_event is set.
    """
    previously_connected = True  # Track the previous connection state
    email_sent = False  # Track if the email has been sent

    while not stop_event.is_set():  # Stop monitoring if stop_event is set
        is_connected = wifi_utils.is_device_connected(user_mac_address)

        if not is_connected and previously_connected:
            # Device just disconnected
            subject = "Wi-Fi Device Disconnected"
            body = f"Dear User,\n\nYour Wi-Fi device ({user_mac_address}) has been disconnected. If this was unexpected, please check your device.\n\nRegards,\nSystem Log AI Team"
            email_utils.send_email(user_email, subject, body)
            print("Wi-Fi is disconnected! Email sent.")
            email_sent = True  # Mark that the email has been sent
            previously_connected = False  # Update the connection state

        elif is_connected and not previously_connected:
            # Device just reconnected
            print("Wi-Fi is reconnected! Resuming monitoring.")
            email_sent = False  # Reset the email flag
            previously_connected = True  # Update the connection state

        elif is_connected and previously_connected:
            # Device is still connected
            print("Wi-Fi is connected. Monitoring...")

        time.sleep(60)  # Check every 60 seconds

    print(f"Wi-Fi monitoring stopped for user: {user_email}")


def start_wifi_monitoring(user_email, user_mac_address):
    """
    Start a new thread to monitor the Wi-Fi connection of a device.
    """
    if user_email in monitoring_threads:
        # Stop the existing monitoring thread if it exists
        monitoring_threads[user_email]["stop_event"].set()
        monitoring_threads[user_email]["thread"].join()

    # Create a stop event for the new monitoring thread
    stop_event = threading.Event()

    # Start a new monitoring thread
    monitor_thread = threading.Thread(target=monitor_wifi_connection, args=(user_email, user_mac_address, stop_event))
    monitor_thread.daemon = True
    monitor_thread.start()

    # Store the thread and stop event in the dictionary
    monitoring_threads[user_email] = {
        "thread": monitor_thread,
        "stop_event": stop_event,
    }


@app.route("/logs", methods=["POST"])
def logs():
    try:
        data = request.get_json()
        # print(f"Incoming Data: {data}")

        # Parse date from the incoming data
        incoming_date = datetime.strptime(data['time'], '%a %b %d %H:%M:%S %Y').date()

        # Fetch user details from the backend
        user_email = data.get("userId")  # Assuming userId is the email
        response = requests.get(f"{JS_API_BASE_URL}/user/{user_email}")
        if response.status_code != 200:
            return jsonify({"error": "User not found"}), 404

        user_data = response.json()
        user_id = user_data.get("userId")  # Get the ObjectId
        user_mac_address = user_data.get("macAddress")

        # Update the userId in the data
        data['userId'] = user_id

        # Check if action is 'login' and the date is today
        if data['action'] == "login" and incoming_date == datetime.today().date():
            # print("Fetching last 30 days' logs from JavaScript API...")

            # Fetch logs using JavaScript API
            response = requests.get(f"{JS_API_BASE_URL}/getlogs")
            if response.status_code == 200:
                last_30_days_logs = response.json().get('logs', [])
                # Save the logs to a JSON file
                with open("30_days_logs.json", "w") as file:
                    json.dump(last_30_days_logs, file, indent=4)
                print(f"30 days' logs saved to 30_days_logs.json")
            else:
                print(f"Failed to fetch logs. API Response: {response.status_code}, {response.text}")

            # Start Wi-Fi monitoring for the user
            start_wifi_monitoring(user_email, user_mac_address)

        # Check if action is 'logout'
        elif data['action'] == "logout":
            # Stop Wi-Fi monitoring for the user
            if user_email in monitoring_threads:
                monitoring_threads[user_email]["stop_event"].set()
                monitoring_threads[user_email]["thread"].join()
                del monitoring_threads[user_email]
                print(f"Wi-Fi monitoring stopped for user: {user_email}")

        # Check if the MAC address matches and the device is connected
        is_connected = wifi_utils.is_device_connected(user_mac_address)
        details = {
            "macAddress": user_mac_address,
            "wifiConnected": is_connected,
        }

        # Update the details object in the log
        data['details'] = details

        # Convert login/logout times for anomaly detection
        login_time = time.time()  # Current timestamp
        logout_time = login_time + 3600  # Assume 1-hour session
        failed_attempts = data.get('failed_attempts', 0)

        # Prepare the event for anomaly detection
        new_event = [[login_time, logout_time, failed_attempts]]

        # Detect anomalies
        is_anomaly = detect_anomaly(new_event)
        if is_anomaly:
            print("Anomaly detected!")
            data['anomaly'] = True  # Mark the log as anomalous
        else:
            print("No anomaly detected.")
            data['anomaly'] = False

        # Push data to JavaScript API
        # print(data)
        create_response = requests.post(f"{JS_API_BASE_URL}/createlog", json=data)
        if create_response.status_code == 201:
            print("Data successfully pushed to JavaScript API.")
            return jsonify({"message": "success", "anomaly": bool(is_anomaly)}), 200
        else:
            print(f"Failed to push data. API Response: {create_response.status_code}, {create_response.text}")
            return jsonify({"error": "Failed to save log to JavaScript API"}), 500

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500
    

if __name__ == "__main__":
    app.run(debug=True)