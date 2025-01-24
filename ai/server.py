import requests
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
import time
import json
from model import detect_anomaly  # Import anomaly detection function

app = Flask(__name__)

JS_API_BASE_URL = "http://localhost:4000/api/logs"

@app.route("/logs", methods=["POST"])
def logs():
    try:
        data = request.get_json()
        print(f"Incoming Data: {data}")

        # Parse date from the incoming data
        incoming_date = datetime.strptime(data['time'], '%a %b %d %H:%M:%S %Y').date()

        # Check if action is 'login' and the date is today
        if data['action'] == "login" and incoming_date == datetime.today().date():
            print("Fetching last 30 days' logs from JavaScript API...")

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
