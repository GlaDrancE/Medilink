from customtkinter import *  # pip install customtkinter
import customtkinter as ctk
from PIL import Image
import tkinter as tk
import requests

def display(frame2, token):


    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }  

    # Fetch summary data from the backend
    try:
        response = requests.get("http://localhost:4000/api/logs/summary", headers=headers)
        if response.status_code == 200:
            data = response.json()
            logins = data.get("logins", 0)
            logouts = data.get("logouts", 0)
            warnings = data.get("warnings", 0)
            anomalies = data.get("anomalies", 0)
        else:
            logins = logouts = warnings = anomalies = 0
    except Exception as e:
        print(f"Error fetching summary: {e}")
        logins = logouts = warnings = anomalies = 0

    # Fetch recent logs from the backend
    try:
        response = requests.get("http://localhost:4000/api/logs/getlogs", headers=headers)
        if response.status_code == 200:
            logs = response.json().get("logs", [])
            # Sort logs by timestamp and get the 5 most recent
            logs = sorted(logs, key=lambda x: x['timestamp'], reverse=True)[:5]
        else:
            logs = []
    except Exception as e:
        print(f"Error fetching logs: {e}")
        logs = []

    # Dashboard Title
    displayLabel = CTkLabel(master=frame2,
                            text_color='black',
                            text='Dashboard',
                            font=('Calibri', 39, 'bold'),
                            fg_color='transparent',
                            bg_color='transparent')
    displayLabel.place(x=50, y=40)

    # Welcome Message
    welcomeLabel = CTkLabel(master=frame2,
                            text_color='grey',
                            text='Welcome to System Log AI',
                            font=('Calibri', 15),
                            fg_color='transparent',
                            bg_color='transparent')
    welcomeLabel.place(x=52, y=90)

    # Summary Section
    overviewLabel = CTkLabel(master=frame2,
                             text_color='black',
                             text='Summary',
                             font=('Calibri', 39, 'bold'),
                             bg_color='#FFFAFA')
    overviewLabel.place(x=50, y=150)  # Adjusted position

    # Logins Card
    loginsOverviewFrame = CTkFrame(master=frame2,
                                   height=150,
                                   width=150,
                                   border_width=1,
                                   fg_color='#FFFFFF',
                                   corner_radius=15)
    loginsOverviewFrame.place(x=150, y=250)  # Adjusted position

    loginIcon = CTkLabel(master=loginsOverviewFrame,
                         text="🔑",
                         font=('Calibri', 30),
                         fg_color='transparent',
                         bg_color='transparent')
    loginIcon.place(x=50, y=20)

    loginsLabel = CTkLabel(master=loginsOverviewFrame,
                           text_color='black',
                           text=f'Logins\n{logins}',
                           font=('Calibri', 20),
                           bg_color='transparent')
    loginsLabel.place(x=30, y=70)

    # Logouts Card
    logoutsOverviewFrame = CTkFrame(master=frame2,
                                    height=150,
                                    width=150,
                                    border_width=1,
                                    fg_color='#FFFFFF',
                                    corner_radius=15)
    logoutsOverviewFrame.place(x=350, y=250)  # Adjusted position

    logoutIcon = CTkLabel(master=logoutsOverviewFrame,
                          text="🚪",
                          font=('Calibri', 30),
                          fg_color='transparent',
                          bg_color='transparent')
    logoutIcon.place(x=50, y=20)

    logoutsLabel = CTkLabel(master=logoutsOverviewFrame,
                            text_color='black',
                            text=f'Logouts\n{logouts}',
                            font=('Calibri', 20),
                            bg_color='transparent')
    logoutsLabel.place(x=30, y=70)

    # Warnings Card
    warningsOverviewFrame = CTkFrame(master=frame2,
                                     height=150,
                                     width=150,
                                     border_width=1,
                                     fg_color='#FFFFFF',
                                     corner_radius=15)
    warningsOverviewFrame.place(x=550, y=250)  # Adjusted position

    warningIcon = CTkLabel(master=warningsOverviewFrame,
                           text="⚠️",
                           font=('Calibri', 30),
                           fg_color='transparent',
                           bg_color='transparent')
    warningIcon.place(x=50, y=20)

    warningsLabel = CTkLabel(master=warningsOverviewFrame,
                             text_color='black',
                             text=f'Warnings\n{warnings}',
                             font=('Calibri', 20),
                             bg_color='transparent')
    warningsLabel.place(x=30, y=70)

    # Anomalies Card
    anomaliesOverviewFrame = CTkFrame(master=frame2,
                                      height=150,
                                      width=250,
                                      border_width=1,
                                      fg_color='#FFFFFF',
                                      corner_radius=15)
    anomaliesOverviewFrame.place(x=750, y=250)  # Adjusted position

    anomalyIcon = CTkLabel(master=anomaliesOverviewFrame,
                           text="🚨",
                           font=('Calibri', 30),
                           fg_color='transparent',
                           bg_color='transparent')
    anomalyIcon.place(x=100, y=20)

    anomaliesLabel = CTkLabel(master=anomaliesOverviewFrame,
                              text_color='black',
                              text=f'Anomalies Detected\n{anomalies}',
                              font=('Calibri', 20),
                              bg_color='transparent')
    anomaliesLabel.place(x=50, y=70)

    # Activity Section
    activityLabel = CTkLabel(master=frame2,
                             text_color='black',
                             text='Recent Activity',
                             font=('Calibri', 39, 'bold'),
                             bg_color='#FFFAFA')
    activityLabel.place(x=50, y=450)  # Adjusted position

    # Scrollable Frame for Activity Cards
    scrollableFrame = CTkScrollableFrame(master=frame2,
                                         width=980,
                                         height=200,
                                         fg_color='#FFFAFA',
                                         corner_radius=10)
    scrollableFrame.place(x=50, y=500)  # Adjusted position

    # Activity Cards
    for log in logs:
        # Create a card for each log entry
        card = CTkFrame(master=scrollableFrame,
                        height=80,
                        width=940,
                        border_width=1,
                        fg_color='#FFFFFF',
                        corner_radius=15)
        card.pack(pady=5, padx=10, fill='x')

        # Add an icon based on the action
        if log['action'] == 'login':
            icon = "🔑"
        elif log['action'] == 'logout':
            icon = "🚪"
        elif log['action'] == 'warning':
            icon = "⚠️"
        else:
            icon = "❓"

        iconLabel = CTkLabel(master=card,
                             text=icon,
                             font=('Calibri', 20),
                             fg_color='transparent',
                             bg_color='transparent')
        iconLabel.place(x=20, y=20)

        # Add action and timestamp
        actionLabel = CTkLabel(master=card,
                               text=f"Action: {log['action'].capitalize()}",
                               font=('Calibri', 16),
                               fg_color='transparent',
                               bg_color='transparent')
        actionLabel.place(x=80, y=20)

        timestampLabel = CTkLabel(master=card,
                                  text=f"Timestamp: {log['timestamp']}",
                                  font=('Calibri', 14),
                                  fg_color='transparent',
                                  bg_color='transparent')
        timestampLabel.place(x=80, y=50)

        # Add anomaly status (if applicable)
        if log.get('anomaly', False):
            anomalyStatus = CTkLabel(master=card,
                                     text="🚨 Anomaly Detected",
                                     font=('Calibri', 14),
                                     text_color='red',
                                     fg_color='transparent',
                                     bg_color='transparent')
            anomalyStatus.place(x=700, y=30)