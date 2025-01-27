import win32evtlog
import win32con
import win32evtlogutil
import time
import requests
import uuid


def get_mac_address():
    """
    Fetch the system's MAC address dynamically.

    Returns:
        str: The MAC address of the system.
    """
    mac = uuid.getnode()
    mac_address = ':'.join(format((mac >> i) & 0xff, '02x') for i in range(0, 8 * 6, 8)[::-1])
    return mac_address


def get_email_from_mac(mac_address):
    """
    Fetch the email associated with a given MAC address by calling the Express.js API.

    Args:
        mac_address (str): The MAC address to search for.

    Returns:
        str: The email address associated with the MAC address, or None if not found.
    """
    try:
        response = requests.post(
            "http://localhost:4000/logs/get-email",
            json={"macAddress": mac_address}
        )
        if response.status_code == 200:
            return response.json().get("email")
        else:
            print(f"Error: {response.json().get('error')}")
            return None
    except Exception as e:
        print(f"Error fetching email: {e}")
        return None


def storeLogs(event_type, event_id, t):
    """
    Store login/logout events by dynamically fetching the email associated with the system's MAC address.

    Args:
        event_type (str): The type of event (e.g., 'login', 'logout').
        event_id (int): The event ID from Windows Event Logs.
        t (str): The time of the event.
    """
    mac_address = get_mac_address()
    email = get_email_from_mac(mac_address)
    if not email:
        print("No user found with the given MAC address.")
        return

    try:
        response = requests.post(
            "http://127.0.0.1:5000/logs",
            json={
                "userId": email,
                "action": event_type,
                "time": t,
                "details": {},
            }
        )
        print(response)
    except Exception as e:
        print(f"Error storing logs: {e}")


def storeLogs(event_type, event_id, t):
    try:
        response = requests.post("http://127.0.0.1:5000/logs", json={"userId": 'yatharthaurangpure27@gmail.com', "action": event_type, "time": t, "details": {}})    
        print(response)
    except Exception as e:
        print(e)

def monitor_login_events():
    """
    Monitor Windows Security log for real-time login/logout events.
    Returns the latest login/logout event when detected.
    """
    server = 'localhost'
    logtype = 'Security'
    flags = win32evtlog.EVENTLOG_FORWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ

    # Event IDs for login/logout events
    LOGIN_EVENT_IDS = {
        4624: "Login",        # Successful login
        4634: "Logout",       # Successful logout
        4647: "User initiated logout"
    }

    def get_last_event():
        hand = win32evtlog.OpenEventLog(server, logtype)
        flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
        total = win32evtlog.GetNumberOfEventLogRecords(hand)
        
        events = win32evtlog.ReadEventLog(hand, flags, 0)
        
        for event in events:
            if event.EventID in LOGIN_EVENT_IDS:
                event_type = LOGIN_EVENT_IDS[event.EventID]
                time_generated = event.TimeGenerated.Format()
                user = ''
                
                # Get user information if available
                try:
                    for data in event.StringInserts:
                        if '@' in data or '\\' in data:  # Usually indicates username
                            user = data
                            break
                except:
                    user = "Unknown"
                
                win32evtlog.CloseEventLog(hand)
                return {
                    'event_type': event_type,
                    'time': time_generated,
                    'user': user,
                    'event_id': event.EventID
                }
        
        win32evtlog.CloseEventLog(hand)
        return None

    last_event = None
    print("Monitoring for login/logout events...")
    
    while True:
        current_event = get_last_event()
        
        if current_event and (not last_event or 
                            current_event['time'] != last_event['time'] or 
                            current_event['event_id'] != last_event['event_id']):
            print(f"\nNew {current_event['event_type']} event detected:")
            print(f"Time: {current_event['time']}")
            print(f"User: {current_event['user']}")
            print(f"Event ID: {current_event['event_id']}")
            last_event = current_event
            storeLogs(current_event["event_type"].lower(), current_event['event_id'], current_event['time'])
        time.sleep(1)  # Check every second

if __name__ == "__main__":
    try:
        monitor_login_events()
    except KeyboardInterrupt:
        print("\nMonitoring stopped.")