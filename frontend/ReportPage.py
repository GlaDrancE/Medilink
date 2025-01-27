from customtkinter import *
import customtkinter as ctk
import requests
import csv
from CTkTable import CTkTable
import os
from tkinter import messagebox 

def showReportScreen(frame, token):
    # Clear the frame
    for widget in frame.winfo_children():
        widget.destroy()

    # Title for the Report Page
    reportLabel = CTkLabel(master=frame,
                           text_color='black',
                           text='Reports',
                           font=('Calibri', 30, 'bold'),
                           bg_color='#FFFAFA')
    reportLabel.place(x=20, y=25)

    # Fetch logs from MongoDB
    logs = fetch_logs(token)

    search_keyword = StringVar()

    def apply_filters():
        filtered_logs = logs
        if search_keyword.get():
            filtered_logs = [log for log in filtered_logs if search_keyword.get().lower() in str(log).lower()]

        update_table(filtered_logs)


    def export_to_csv():
        """
        Export logs to a CSV file in the user's Downloads folder.
        """
        if logs:
            try:
                # Get the user's Downloads folder
                downloads_folder = os.path.join(os.path.expanduser("~"), "Downloads")
                file_path = os.path.join(downloads_folder, "logs.csv")

                # Write the logs to a CSV file
                with open(file_path, "w", newline="", encoding="utf-8") as csvfile:
                    writer = csv.writer(csvfile)
                    writer.writerow(["Date", "Action", "Time", "bluetoothAddress", "WifiConnected", "Anomaly"])
                    for log in logs:
                        timestamp = log.get("timestamp", "")
                        date = timestamp.split("T")[0] if timestamp else ""
                        time = timestamp.split("T")[1].split(".")[0] if timestamp else ""
                        details = log.get("details", {}) or {}
                        writer.writerow([
                            date,
                            log.get("action", ""),
                            time,
                            details.get("bluetoothAddress", ""),
                            str(details.get("wifiConnected", "")),
                            str(log.get("anomaly", ""))
                        ])

                # Show success message
                success_label = CTkLabel(master=frame, 
                                        text=f"Logs exported successfully to {file_path}", 
                                        text_color="green", 
                                        font=("Calibri", 18), 
                                        bg_color='#FFFAFA')
                success_label.place(x=20, y=730)

            except Exception as e:
                # Show error message
                error_label = CTkLabel(master=frame, 
                                    text="Error exporting logs. Please try again.", 
                                    text_color="red", 
                                    font=("Calibri", 14), 
                                    bg_color='#FFFAFA')
                error_label.place(x=20, y=760)
                print(f"Error: {e}")
        else:
            # Show no logs message
            no_logs_label = CTkLabel(master=frame, 
                                    text="No logs available to export.", 
                                    text_color="orange", 
                                    font=("Calibri", 14), 
                                    bg_color='#FFFAFA')
            no_logs_label.place(x=20, y=760)

    def refresh_logs():
        nonlocal logs
        logs = fetch_logs(token)
        update_table(logs)

    def update_table(logs):
        # Reverse the logs to show the latest logs at the top
        logs.reverse()

        # Table data preparation
        table_data = [["Date", "Action", "Time", "bluetoothAddress", "Bluetooth Connected", "Anomaly"]]

        for log in logs:
            timestamp = log.get("timestamp", "")
            date = timestamp.split("T")[0] if timestamp else ""
            time = timestamp.split("T")[1].split(".")[0] if timestamp else ""
            details = log.get("details", {}) or {}

            table_data.append([
                date,
                log.get("action", ""),
                time,
                details.get("bluetoothAddress", ""),
                str(details.get("bluetoothConnected", "")),
                str(log.get("anomaly", ""))
            ])

        # Clear existing table and recreate
        for widget in scrollable_frame.winfo_children():
            widget.destroy()

        table = CTkTable(master=scrollable_frame,
                         row=len(table_data),
                         column=len(table_data[0]),
                         values=table_data)
        table.pack(expand=True, fill="both", padx=10, pady=10)

        # Highlight rows where anomaly is true
        for i in range(1, len(table_data)):
            if table_data[i][5].lower() == "true":
                for j in range(len(table_data[i])):
                    table.edit_row(i, fg_color="red", text_color="white")

    # Search Bar
    search_label = CTkLabel(master=frame, text="Search:", font=("Calibri", 14), bg_color='#FFFAFA')
    search_label.place(x=25, y=90)

    search_entry = CTkEntry(master=frame, textvariable=search_keyword, width=200)
    search_entry.place(x=80, y=90)

    # Apply Filters Button
    filter_button = CTkButton(master=frame, text="Apply Filters", command=apply_filters)
    filter_button.place(x=300, y=90)

    # Export to CSV Button
    export_button = CTkButton(master=frame, text="Export to CSV", command=export_to_csv)
    export_button.place(x=700, y=90)

    # Refresh Button
    refresh_button = CTkButton(master=frame, text="Refresh", command=refresh_logs)
    refresh_button.place(x=860, y=90)

    # Scrollable frame for the table
    scrollable_frame = CTkScrollableFrame(master=frame,
                                          width=1000,  # Adjust width as needed
                                          height=600,  # Adjust height as needed
                                          fg_color='#FFFAFA')
    scrollable_frame.place(x=20, y=130)

    # Initialize table
    update_table(logs)

def fetch_logs(token):
    """
    Fetch logs from the MongoDB database using the API.
    """
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.get("http://localhost:4000/api/logs/getlogs", headers=headers)
        if response.status_code == 200:
            return response.json().get("logs", [])
        else:
            print(f"Failed to fetch logs: {response}")
            return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []
