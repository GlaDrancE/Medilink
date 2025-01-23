import win32evtlog
import win32con
import win32evtlogutil
import time
import requests


def storeLogs(event_type, event_id, t):

    try:
        response = requests.post("http://localhost:5000/api/logs/createlog", json={"userId": '677fb5ab967f6fa7fffca823', "action": event_type, "time": t, "details": "None"})    
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