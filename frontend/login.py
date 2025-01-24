# import os
# import datetime
# from pymongo import MongoClient


# def log_event(event_type, username):
#     # Connect to MongoDB
#     client = MongoClient("mongodb://localhost:27017/")  # Update with your MongoDB URI
#     db = client["system_logs"]  # Database name

#     # Collection for login events
#     collection = db["startup_logs"]  # Collection for startup events

#     # Create the event document
#     event = {
#         "event_type": event_type,
#         "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),  # Format for date and time
#         "username": username
#     }

#     # Insert the event into MongoDB
#     collection.insert_one(event)
#     print(f"Logged {event_type} event for user '{username}' to MongoDB in collection '{collection.name}'.")


# if __name__ == "__main__":
#     username = input("Enter your username: ")
#     log_event("Login", username)
