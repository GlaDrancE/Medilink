from customtkinter import *
import customtkinter as ctk
from tkinter import ttk
from PIL import Image
import tkinter as tk

def display(frame2, root):
    frame2.destroy()

    #Recreating frame2
    frame2 = CTkFrame(master=root,
                      fg_color='#FFFAFA',
                      height=780,
                      width=1100,
                      border_width=1,
                      corner_radius=15)
    frame2.place(x=390, y=10)
    
    #Adding Reports Title
    displayLabel = CTkLabel(master=frame2,
                            text_color='black',
                             text='Reports',
                             font=('Calibri', 39, 'bold'),
                            fg_color='transparent',
                             bg_color='transparent')
    displayLabel.place(x=50, y=40)

    #Adding OptionMenu
    optionMenu = CTkOptionMenu(master=frame2,
                                values=["Sort by", "Last 7 days", "Last 15 days", "Last 30 days"],  # Dropdown options
                                corner_radius=8,
                                button_color="#DCDCDC",
                                fg_color="#DCDCDC",
                                text_color="#424949",
                                button_hover_color="#DCDCDC",
                                font=("Calibri", 14),   # Font for the options
                                width=200                 # Width of the dropdown menu
                                #command=specify_command  # Callback for when an option is selected
                               )
    optionMenu.place(x=850, y=120)

    #Adding Table
    style = ttk.Style()  #for stylings the table
    style.configure("Treeview.Heading",  # Target Treeview headings
                    font=("Calibri", 18, "bold"),  # Set font and size
                    padding=(10, 5),  # Add padding around text
                    foreground="black",
                    rowheight=50
    )
    style.configure("Treeview", rowheight=40, font=("Calibri", 14))


    tree = ttk.Treeview(master=frame2, 
                        columns=("Username", "Login Time", "Logout Time", "Warnings", "Bluetooth Status"), 
                        show="headings",
                        height=8)
    tree.place(x=70, y=200, width=1240, height=700)


    tree.heading("Username", text="Username")
    tree.heading("Login Time", text="Login Time")
    tree.heading("Logout Time", text="Logout Time")
    tree.heading("Warnings", text="Warnings")
    tree.heading("Bluetooth Status", text="Bluetooth Status")

    # Define column widths and center-align data
    tree.column("Username", width=100, anchor="center")  # Center align
    tree.column("Login Time", width=150, anchor="center")  # Center align
    tree.column("Logout Time", width=100, anchor="center")  # Center align
    tree.column("Warnings", width=150, anchor="center")  # Center align
    tree.column("Bluetooth Status", width=100, anchor="center")  # Center align

    data = [
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status"),
        ("Sample Name", "Sample Login", "Sample Logout", "Sample Warnings", "Sample BT Status")
    ]

    for row in data:
        tree.insert("", tk.END, values=row)
