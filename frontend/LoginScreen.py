from customtkinter import *
import customtkinter as ctk
import tkinter as tk
from PIL import Image
import numpy as np
import requests
import Dashboard
import email_utils
import wifi_utils
import threading
import time
import re
import ReportPage
import uuid


monitoring_active = True

def handleLogout():
    global monitoring_active
    monitoring_active = False
    for widget in root.winfo_children():
        widget.destroy()
    
    # Show the login screen
    showLoginScreen()

def showMainWindow(frame, token):
    frame.destroy()
    frame1 = CTkFrame(master=root,
                      fg_color='#FFFAFA',
                      height=780,
                      width=370,
                      border_width=1,
                      corner_radius=15)
    frame1.place(x=10, y=10)

    frame2 = CTkFrame(master=root,
                      fg_color='#FFFAFA',
                      height=780,
                      width=1100,
                      border_width=1,
                      corner_radius=15)
    frame2.place(x=390, y=10)

    Dashboard.display(frame2, token)

    headLabel = CTkLabel(master=root,
                         text_color='black',
                         text='System Log AI',
                         font=('Calibri', 26, 'bold'),
                         bg_color='#FFFAFA')
    headLabel.place(x=30, y=40)

    homeImage = Image.open('home.png')
    homeButton = CTkButton(master=frame1,
                           text='Dashboard',
                           font=('Calibri', 20),
                           text_color='#000000',
                           fg_color='transparent',
                           corner_radius=8,
                           hover_color='#DCDCDC',
                           image=CTkImage(light_image=homeImage),
                           width=330, anchor=tk.W,
                           command=lambda:Dashboard.display(frame2, token))
    homeButton.place(x=30, y=100)

    reportImage = Image.open('report.png')
    reportButton = CTkButton(master=frame1,
                         text='Reports',
                         font=('Calibri', 20),
                         text_color='#000000',
                         fg_color='transparent',
                         corner_radius=8,
                         hover_color='#DCDCDC',
                         image=CTkImage(light_image=reportImage),
                         width=330, anchor=tk.W,
                         command=lambda: ReportPage.showReportScreen(frame2, token))  
    reportButton.place(x=30, y=150)


    helpImage = Image.open('help.png')
    helpButton = CTkButton(master=frame1,
                           text='Help',
                           font=('Calibri', 20),
                           text_color='#000000',
                           fg_color='transparent',
                           corner_radius=8,
                           hover_color='#DCDCDC',
                           image=CTkImage(light_image=helpImage),
                           width=330, anchor=tk.W)
    helpButton.place(x=30, y=200)

    feedbackImage = Image.open('feedback.png')
    feedbackButton = CTkButton(master=frame1,
                               text='Feedback',
                               font=('Calibri', 20),
                               text_color='#000000',
                               fg_color='transparent',
                               corner_radius=8,
                               hover_color='#DCDCDC',
                               image=CTkImage(light_image=feedbackImage),
                               width=330, anchor=tk.W)
    feedbackButton.place(x=30, y=250)

    logoutImage = Image.open('logout.png')
    logoutButton = CTkButton(master=frame1,
                         text='Log-out',
                         font=('Calibri', 20),
                         text_color='#000000',
                         fg_color='transparent',
                         corner_radius=8,
                         hover_color='#DCDCDC',
                         image=CTkImage(light_image=logoutImage),
                         width=330, anchor=tk.W,
                         command=handleLogout)  # Call handleLogout when clicked
    logoutButton.place(x=30, y=300)

    def handleExit():
        global monitoring_active
        monitoring_active = False
        root.destroy()
        exit(0) 

    exitImage = Image.open('exit.png')
    exitButton = CTkButton(
        master=frame1,
        text='Exit',
        font=('Calibri', 20),
        text_color='#000000',
        fg_color='transparent',
        corner_radius=8,
        hover_color='#DCDCDC',
        image=CTkImage(light_image=exitImage),
        width=330,
        anchor=tk.W,
        command=handleExit  # Calls the exit function
    )
    exitButton.place(x=30, y=350)


def showRegistrationScreen():
    global frame  # Declare 'frame' as global at the beginning of the function
    if 'frame' in globals():
        frame.destroy()

    # Create a new frame for the registration screen
    frame = CTkFrame(master=root,
                     fg_color='#FFFAFA',
                     height=550,  # Increased height to accommodate the new field
                     width=400,
                     border_width=1,
                     corner_radius=15)
    frame.place(x=550, y=150)

    # Registration Title
    registrationLabel = CTkLabel(master=frame,
                                 text_color='black',
                                 text='REGISTER',
                                 font=('Calibri', 30, 'bold'),
                                 bg_color='#FFFAFA')
    registrationLabel.place(x=140, y=40)

    # Username Field
    usernameLabel = CTkLabel(master=frame,
                             text_color='black',
                             text='Username',
                             font=('Calibri', 15),
                             bg_color='#FFFAFA')
    usernameLabel.place(x=20, y=80)

    global usernameBox
    usernameBox = CTkEntry(master=frame,
                           text_color='black',
                           width=360,
                           height=40,
                           border_width=1,
                           fg_color='transparent',
                           corner_radius=10,
                           font=('Calibri', 14))
    usernameBox.place(x=20, y=110)

    # Email Field
    emailLabel = CTkLabel(master=frame,
                          text_color='black',
                          text='Email',
                          font=('Calibri', 15),
                          bg_color='#FFFAFA')
    emailLabel.place(x=20, y=170)

    global emailBox
    emailBox = CTkEntry(master=frame,
                        text_color='black',
                        width=360,
                        height=40,
                        border_width=1,
                        fg_color='transparent',
                        corner_radius=10,
                        font=('Calibri', 14))
    emailBox.place(x=20, y=200)

    # Password Field
    passwordLabel = CTkLabel(master=frame,
                             text_color='black',
                             text='Password',
                             font=('Calibri', 15),
                             bg_color='#FFFAFA')
    passwordLabel.place(x=20, y=260)

    global passwordBox
    passwordBox = CTkEntry(master=frame,
                           width=360,
                           height=40,
                           border_width=1,
                           fg_color='transparent',
                           corner_radius=10,
                           font=('Calibri', 14),
                           text_color='black',
                           show="*")
    passwordBox.place(x=20, y=290)

    
    bluetoothAddressLabel = CTkLabel(master=frame,
                            text_color='black',
                            text='Bluetooth Address',
                            font=('Calibri', 15),
                            bg_color='#FFFAFA')
    bluetoothAddressLabel.place(x=20, y=350)

    global bluetoothAddressBox
    bluetoothAddressBox = CTkEntry(master=frame,
                            text_color='black',
                            width=360,
                            height=40,
                            border_width=1,
                            fg_color='transparent',
                            corner_radius=10,
                            font=('Calibri', 14))
    bluetoothAddressBox.place(x=20, y=380)

    # Add placeholder text
    bluetoothAddressBox.configure(placeholder_text="e.g., a4:55:90:55:cc:03")

    # Register Button
    registerButton = CTkButton(master=frame,
                               text='Register',
                               font=('Calibri', 18),
                               text_color='#FFFAFA',
                               fg_color='#2e4053',
                               corner_radius=8,
                               width=360,
                               height=40,
                               command=handleRegistration)
    registerButton.place(x=20, y=440)

    # Error Message Label
    global error_message, error_message_label
    error_message = tk.StringVar()
    error_message_label = CTkLabel(master=frame,
                                   textvariable=error_message,
                                   text_color='red',
                                   font=('Calibri', 12),
                                   bg_color='#FFFAFA')
    error_message_label.place(x=20, y=490)

    # Login Link
    loginLink = CTkLabel(master=frame,
                         text="Already have an account? Login here",
                         text_color='blue',
                         font=('Calibri', 12),
                         cursor="hand2",
                         bg_color='#FFFAFA')
    loginLink.place(x=100, y=520)
    loginLink.bind("<Button-1>", lambda e: showLoginScreen())


def showLoginScreen():
    global frame  # Declare 'frame' as global at the beginning of the function
    if 'frame' in globals():
        frame.destroy()

    # Create a new frame for the login screen
    frame = CTkFrame(master=root,
                     fg_color='#FFFAFA',
                     height=410,
                     width=400,
                     border_width=1,
                     corner_radius=15)
    frame.place(x=550, y=150)

    # Login Title
    loginLabel = CTkLabel(master=frame,
                          text_color='black',
                          text='LOG-IN',
                          font=('Calibri', 30, 'bold'),
                          bg_color='#FFFAFA')
    loginLabel.place(x=160, y=40)

    # Email Field
    emailLabel = CTkLabel(master=frame,
                          text_color='black',
                          text='Email',
                          font=('Calibri', 15),
                          bg_color='#FFFAFA')
    emailLabel.place(x=20, y=80)

    global usernameBox
    usernameBox = CTkEntry(master=frame,
                           text_color='black',
                           width=360,
                           height=40,
                           border_width=1,
                           fg_color='transparent',
                           corner_radius=10,
                           font=('Calibri', 14))
    usernameBox.place(x=20, y=110)
    usernameBox.insert(0, "vaishaliaurangpure777@gmail.com")

    # Password Field
    passwordLabel = CTkLabel(master=frame,
                             text_color='black',
                             text='Password',
                             font=('Calibri', 15),
                             bg_color='#FFFAFA')
    passwordLabel.place(x=20, y=170)

    global passwordBox
    passwordBox = CTkEntry(master=frame,
                           width=360,
                           height=40,
                           border_width=1,
                           fg_color='transparent',
                           corner_radius=10,
                           font=('Calibri', 14),
                           text_color='black',
                           show="*")
    passwordBox.place(x=20, y=200)
    passwordBox.insert(0, "Vaishali777")

    # Forgot Password Button
    forgotPasswordButton = CTkButton(master=frame,
                                     text='Forgot Password?',
                                     font=('Calibri', 12),
                                     text_color='#000000',
                                     fg_color='transparent',
                                     corner_radius=8,
                                     hover_color='#FFFAFA',
                                     width=50, anchor=tk.N)
    forgotPasswordButton.place(x=285, y=240)

    # Login Button
    loginButton = CTkButton(master=frame,
                            text='Log-in',
                            font=('Calibri', 18),
                            text_color='#FFFAFA',
                            fg_color='#2e4053',
                            corner_radius=8,
                            width=360,
                            height=40,
                            command=handleLogin)
    loginButton.place(x=20, y=290)

    # Error Message Label
    global error_message, error_message_label
    error_message = tk.StringVar()
    error_message_label = CTkLabel(master=frame,
                                   textvariable=error_message,
                                   text_color='red',
                                   font=('Calibri', 12),
                                   bg_color='#FFFAFA')
    error_message_label.place(x=20, y=340)

    # Registration Link
    registrationLink = CTkLabel(master=frame,
                                text="Don't have an account? Register here",
                                text_color='blue',
                                font=('Calibri', 12),
                                cursor="hand2",
                                bg_color='#FFFAFA')
    registrationLink.place(x=100, y=380)
    registrationLink.bind("<Button-1>", lambda e: showRegistrationScreen())


# def monitor_wifi_connection(user_email, user_blue_address):
#     """
#     Continuously monitor the Wi-Fi connection of a device.
#     Send an email only once when the device disconnects.
#     Resume monitoring if the device reconnects.
#     """
#     previously_connected = True  # Track the previous connection state
#     email_sent = False  # Track if the email has been sent

#     while True:  # Infinite loop for continuous monitoring
#         try:
#             is_connected = wifi_utils.is_device_connected(user_blue_address)
#         except Exception as e:
#             print(f"Error checking Wi-Fi connection: {e}")


#         if not is_connected and previously_connected:
#             # Device just disconnected
#             subject = "Wi-Fi Device Disconnected"
#             body = f"Dear User,\n\nYour Wi-Fi device ({user_blue_address}) has been disconnected. If this was unexpected, please check your device.\n\nRegards,\nSystem Log AI Team"
#             email_utils.send_email(user_email, subject, body)
#             print("Wi-Fi is disconnected! Email sent.")
#             email_sent = True  # Mark that the email has been sent
#             previously_connected = False  # Update the connection state

#         elif is_connected and not previously_connected:
#             # Device just reconnected
#             print("Wi-Fi is reconnected! Resuming monitoring.")
#             email_sent = False  # Reset the email flag
#             previously_connected = True  # Update the connection state

#         elif is_connected and previously_connected:
#             # Device is still connected
#             print("Wi-Fi is connected. Monitoring...")

#         time.sleep(60)  # Check every 60 seconds

# def start_wifi_monitoring(user_email, user_blue_address):
#     monitor_thread = threading.Thread(target=monitor_wifi_connection, args=(user_email, user_blue_address))
#     monitor_thread.daemon = True
#     monitor_thread.start()

def handleLogin():
    user_name = usernameBox.get()
    password = passwordBox.get()

    url = 'http://localhost:4000'
    payload = {
        'email': user_name,
        'password': password,
    }
    header = {
        'Content-Type': "application/json"
    }

    try:
        response = requests.post(f"{url}/api/auth/login", json=payload, headers=header)

        if response.status_code == 200:
            token = response.json().get("token")
            user_email = user_name  # Assuming email is the username
            user_blue_address = response.json().get("bluetoothAddress")  # Get blue address from the response

            # start_wifi_monitoring(user_email, user_blue_address)

            showMainWindow(frame, token)
        else:
            # Display an error message when credentials are incorrect
            error_message.set("Invalid email or password. Please try again.")

    except Exception as e:
        print(e)
        # Display an error message if an exception occurs
        error_message.set("An error occurred. Please check your connection.")

def validate_blue_address(blue_address):
    """
    Validate the Bluetooth address format (e.g., a4:55:90:55:cc:03 or A4-55-90-55-CC-03).

    Args:
        blue_address (str): The Bluetooth address to validate.

    Returns:
        bool: True if the Bluetooth address is valid, False otherwise.
    """
    # Regex pattern for Bluetooth address validation
    pattern = r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
    
    # Check if the address matches the pattern
    if re.match(pattern, blue_address):
        return True
    else:
        return False

def get_mac_address():
    """
    Get the MAC address of the user's device.
    """
    mac = uuid.getnode()
    mac_address = ':'.join(f'{(mac >> i) & 0xff:02x}' for i in range(0, 8 * 6, 8)[::-1])
    return mac_address

def handleRegistration():
    username = usernameBox.get()
    email = emailBox.get()
    password = passwordBox.get()
    blue_address = bluetoothAddressBox.get().strip()  # Get blue address from the input field and remove leading/trailing spaces

    # Validate blue address format
    if not validate_blue_address(blue_address):
        error_message.set("Invalid Bluetooth address format. Please use the format: a4:55:90:55:cc:03")
        return

    # Get the user's MAC address
    mac_address = get_mac_address()

    url = 'http://localhost:4000'
    payload = {
        'username': username,
        'email': email,
        'password': password,
        'bluetoothAddress': blue_address,  # Include Bluetooth address
        'macAddress': mac_address,  # Include MAC address
    }
    header = {
        'Content-Type': "application/json"
    }

    try:
        response = requests.post(f"{url}/api/auth/register", json=payload, headers=header)

        if response.status_code == 201:
            # Registration successful
            error_message.set("Registration successful! Redirecting to Dashboard...")
            token = response.json().get("token")
            root.after(2000, lambda: showMainWindow(frame, token))  # Redirect after 2 seconds
        elif response.status_code == 400:
            # Handle validation errors from the backend
            errors = response.json().get("errors", [])
            if errors:
                # Extract error messages and display them
                error_messages = [error['msg'] for error in errors]
                error_message.set("\n".join(error_messages))
            else:
                # Handle other 400 errors (e.g., duplicate email)
                error_message.set(response.json().get("error", "Registration failed. Please try again."))
        else:
            # Handle other errors
            error_message.set("Registration failed. Please try again.")
    except Exception as e:
        print(e)
        # Display an error message if an exception occurs
        error_message.set("An error occurred. Please check your connection.")


# Main Application
if __name__ == '__main__':
    root = CTk(fg_color='#FFFAFA')
    root.title("SystemLogAI")
    root.geometry("1500x800+10+20")
    set_appearance_mode("light")

    # Show the Login Screen by default
    showLoginScreen()

    root.mainloop()