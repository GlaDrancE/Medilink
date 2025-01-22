import win32evtlog
import requests
import time
import datetime



def storeLogs(event_type, event_id, t):
    # payload = {
    #     "userId": '677fb5ab967f6fa7fffca823',
    #     "action": event,
    # }
    # logs = requests.post('http://localhost:5000/api/logs/createlog', json={payload}, headers={"Content-Type0": "application/json"})
    # print(logs)
    with open("A:/Beautiful Pain/Projects/AI Logs Analyzer/logs-analyzer/dist/event_log.txt", "a") as log_file:
        log_file.write(f"\nEvent ID: {event_id} | Type: {event_type} | Time: {t}\n")

def track_logon_logoff():


    try:    
        server = 'localhost'  # Local machine
        log_type = 'Security'  # Security log contains login/logout events

        # Open the event log
        handle = win32evtlog.OpenEventLog(server, log_type)
        flags = win32evtlog.EVENTLOG_FORWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
        last_record = win32evtlog.GetOldestEventLogRecord(handle)
        print("Last Record: ", last_record)

        print("Tracking login and logout events... Press Ctrl+C to stop.")
        while True:
            total_records = win32evtlog.GetNumberOfEventLogRecords(handle)
            print("Total Records",total_records)
            ''' 
            for event in events:
                if event.EventID == 4648:  # Successful login
                    print(f"Logon: User: {event.StringInserts[5]}, Time: {event.TimeGenerated}")
                    
                    storeLogs("login", event.EventID, event.TimeGenerated)
                if event.EventID == 4624:  # Successful login
                    print(f"Logon: User: {event.StringInserts[5]}, Time: {event.TimeGenerated}")
                    
                    storeLogs("Login: ", event.EventID, event.TimeGenerated)


                elif event.EventID == 4647:  # Logoff
                    print(f"Logoff: User: {event.StringInserts[5]}, Time: {event.TimeGenerated}")
                    storeLogs("Logout", event.EventID,event.TimeGenerated)
                '''
            
            # Event ID: 4624 | Type: login | Time: 2025-01-13 13:51:21
            if last_record <= total_records:
                events = win32evtlog.ReadEventLog(handle, flags, last_record)
                for event in events:
                    if event.EventID in [4624, 4647, 4648]:  # Handle both login and logoff events
                        if event.StringInserts and len(event.StringInserts) > 5:
                            user = event.StringInserts[5]
                        else:
                            user = "Unknown"  # Fallback if user information is unavailable
                        if event.EventID == 4624:  # Successful login
                            print(f"Logon: User: {user}, Time: {event.TimeGenerated}")
                            storeLogs("login", event.EventID, event.TimeGenerated)
                        if event.EventID == 4648:  # Successful login
                            print(f"Logon: User: {user}, Time: {event.TimeGenerated}")
                            storeLogs("Cred Login", event.EventID, event.TimeGenerated)
                        elif event.EventID == 4647:  # Logoff
                            print(f"Logoff: User: {user}, Time: {event.TimeGenerated}")
                            storeLogs("logout", event.EventID, event.TimeGenerated)
                last_record += len(events)
            time.sleep(0.2)  # Check logs every 2 seconds
            #Event ID: 4624 | Type: login | Time: 2025-01-12 17:36:19
    except Exception as e:
        storeLogs("Exception: ", e, datetime.datetime.now())
if __name__ == "__main__":
    try:
        track_logon_logoff()
    except Exception as e:
        print(e)
        storeLogs("No records", 404)
