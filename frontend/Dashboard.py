from customtkinter import *  # pip install customtkinter
import customtkinter as ctk
from PIL import Image
import tkinter as tk
import requests
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

def display(frame2, token):

    for widget in frame2.winfo_children():
        widget.destroy()
    
    headers = {
        'authorization': f'Bearer {token}',
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

    try:
        # Fetch login/logout counts for different time ranges
        counts_response = requests.get("http://localhost:4000/api/logs/counts", headers=headers)
        if counts_response.status_code == 200:
            counts_data = counts_response.json()["counts"]
        else:
            counts_data = {
                "5_days": {"logins": 0, "logouts": 0, "anomalies": 0},
                "10_days": {"logins": 0, "logouts": 0, "anomalies": 0},
                "15_days": {"logins": 0, "logouts": 0, "anomalies": 0},
                "30_days": {"logins": 0, "logouts": 0, "anomalies": 0}
            }

    except Exception as e:
        print(f"Error fetching report data: {e}")
        counts_data = {
            "5_days": {"logins": 0, "logouts": 0, "anomalies": 0},
            "10_days": {"logins": 0, "logouts": 0, "anomalies": 0},
            "15_days": {"logins": 0, "logouts": 0, "anomalies": 0},
            "30_days": {"logins": 0, "logouts": 0, "anomalies": 0}
        }

    # Prepare data for the bar chart
    time_ranges = ["5 Days", "10 Days", "15 Days", "30 Days"]
    loginsChart = [counts_data["5_days"]["logins"], counts_data["10_days"]["logins"],
              counts_data["15_days"]["logins"], counts_data["30_days"]["logins"]]
    logoutsChart = [counts_data["5_days"]["logouts"], counts_data["10_days"]["logouts"],
               counts_data["15_days"]["logouts"], counts_data["30_days"]["logouts"]]
    anomaliesChart = [counts_data["5_days"]["anomalies"], counts_data["10_days"]["anomalies"],
                 counts_data["15_days"]["anomalies"], counts_data["30_days"]["anomalies"]]


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
    overviewLabel.place(x=50, y=130)  # Adjusted position

    # Logins Card
    loginsOverviewFrame = CTkFrame(master=frame2,
                                   height=150,
                                   width=200,
                                   border_width=1,
                                   fg_color='#FFFFFF',
                                   corner_radius=15)
    loginsOverviewFrame.place(x=80, y=200) 

    loginIcon = CTkLabel(master=loginsOverviewFrame,
                         text="🔑",
                         font=('Calibri', 35),
                         fg_color='transparent',
                         bg_color='transparent')
    loginIcon.place(x=70, y=25)

    loginsLabel = CTkLabel(master=loginsOverviewFrame,
                           text_color='black',
                           text=f'Logins\n{logins}',
                           font=('Calibri', 25),
                           bg_color='transparent')
    loginsLabel.place(x=55, y=80)

    # Logouts Card
    logoutsOverviewFrame = CTkFrame(master=frame2,
                                    height=150,
                                    width=200,
                                    border_width=1,
                                    fg_color='#FFFFFF',
                                    corner_radius=15)
    logoutsOverviewFrame.place(x=330, y=200)  # Adjusted position

    logoutIcon = CTkLabel(master=logoutsOverviewFrame,
                          text="🚪",
                          font=('Calibri', 35),
                          fg_color='transparent',
                          bg_color='transparent')
    logoutIcon.place(x=70, y=25)

    logoutsLabel = CTkLabel(master=logoutsOverviewFrame,
                            text_color='black',
                            text=f'Logouts\n{logouts}',
                            font=('Calibri', 25),
                            bg_color='transparent')
    logoutsLabel.place(x=55, y=80)

    # Warnings Card
    warningsOverviewFrame = CTkFrame(master=frame2,
                                     height=150,
                                     width=200,
                                     border_width=1,
                                     fg_color='#FFFFFF',
                                     corner_radius=15)
    warningsOverviewFrame.place(x=580, y=200)  # Adjusted position

    warningIcon = CTkLabel(master=warningsOverviewFrame,
                           text="⚠️",
                           font=('Calibri', 35),
                           fg_color='transparent',
                           bg_color='transparent')
    warningIcon.place(x=70, y=25)

    warningsLabel = CTkLabel(master=warningsOverviewFrame,
                             text_color='black',
                             text=f'Warnings\n{warnings}',
                             font=('Calibri', 25),
                             bg_color='transparent')
    warningsLabel.place(x=45, y=80)

    # Anomalies Card
    anomaliesOverviewFrame = CTkFrame(master=frame2,
                                      height=150,
                                      width=200,
                                      border_width=1,
                                      fg_color='#FFFFFF',
                                      corner_radius=15)
    anomaliesOverviewFrame.place(x=830, y=200)  # Adjusted position

    anomalyIcon = CTkLabel(master=anomaliesOverviewFrame,
                           text="🚨",
                           font=('Calibri', 35),
                           fg_color='transparent',
                           bg_color='transparent')
    anomalyIcon.place(x=70, y=25)

    anomaliesLabel = CTkLabel(master=anomaliesOverviewFrame,
                              text_color='black',
                              text=f'Anomalies\n{anomalies}',
                              font=('Calibri', 25),
                              bg_color='transparent')
    anomaliesLabel.place(x=45, y=80)

    # Activity Section
    reportLabel = CTkLabel(master=frame2,
                            text_color='black',
                            text='Insights',
                            font=('Calibri', 39, 'bold'),
                            bg_color='transparent')
    reportLabel.place(x=50, y=400)

    
    # Create a bar chart
    fig, ax = plt.subplots(figsize=(8, 4))
    bar_width = 0.25
    index = range(len(time_ranges))

    # Plot logins, logouts, and anomalies
    bar1 = ax.bar(index, loginsChart, bar_width, label="Logins", color='#2e4053')
    bar2 = ax.bar([i + bar_width for i in index], logoutsChart, bar_width, label="Logouts", color='#f4a261')
    bar3 = ax.bar([i + 2 * bar_width for i in index], anomaliesChart, bar_width, label="Anomalies", color='#e63946')

    ax.set_xlabel('Time Range')
    ax.set_ylabel('Count')
    ax.set_title('Logins, Logouts, and Anomalies Over Time')
    ax.set_xticks([i + bar_width for i in index])
    ax.set_xticklabels(time_ranges)
    ax.legend()

    # Embed the chart in the Tkinter frame
    canvas = FigureCanvasTkAgg(fig, master=frame2)
    canvas.draw()
    canvas.get_tk_widget().place(x=300, y=525)

    # Add a description
    descriptionLabel = CTkLabel(master=frame2,
                                text_color='black',
                                text="This chart shows the number of logins, logouts, and anomalies over the past 5, 10, 15, and 30 days.",
                                font=('Calibri', 14),
                                bg_color='transparent')
    descriptionLabel.place(x=280, y=750)
    