# import datetime
# from pymongo import MongoClient


# def log_event(event_type, username):
#     # Connect to MongoDB
#     client = MongoClient("mongodb://localhost:27017/")  # Update with your MongoDB URI if needed
#     db = client["system_logs"]  # Your database name

#     if event_type == "Logout":
#         # Collections for login and logout events
#         logout_collection = db["logoff_logs"]  # Collection for logoff/shutdown events
#         login_collection = db["startup_logs"]  # Collection for login events

#         # Get the latest login event for this user
#         last_login = login_collection.find_one({"username": username}, sort=[("timestamp", -1)])

#         if last_login:
#             # Parse the login time
#             login_time = datetime.datetime.strptime(last_login["timestamp"], "%Y-%m-%d %H:%M:%S")
#             logout_time = datetime.datetime.now()  # Current logout time
#             usage_duration = logout_time - login_time  # Calculate usage duration

#             # Create the logout event document
#             event = {
#                 "event_type": event_type,
#                 "timestamp": logout_time.strftime("%Y-%m-%d %H:%M:%S"),  # Logout timestamp
#                 "username": username,
#                 "usage_duration": str(usage_duration)  # Usage duration as a string
#             }

#             # Insert the logout event into MongoDB
#             logout_collection.insert_one(event)
#             print(f"Logged {event_type} event for user '{username}' to MongoDB in collection '{logout_collection.name}'.")
#             print(f"Total usage duration: {usage_duration}")
#         else:
#             print("No previous login record found for this user.")
#     else:
#         print("Unsupported event type.")


# if __name__ == "__main__":
#     username = input("Enter your username: ")
#     log_event("Logout", username)
