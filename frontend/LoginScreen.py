from customtkinter import *
import customtkinter as ctk
import tkinter as tk
import os
from PIL import Image
import numpy as np
import requests
import Dashboard

def showMainWindow(frame):
    frame.destroy()
    #root=CTkToplevel(loginWindow, fg_color='#FFFAFA')
    #root.title("SystemLogAI")
    #root.geometry("1500x800+10+20")
    #root.resizable(False,False)
    #set_appearance_mode("light")

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

    Dashboard.display(frame2)

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
                           command=lambda:Dashboard.display(frame2))
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
                             width=330, anchor=tk.W)
    reportButton.place(x=30, y=150)

    settingsImage = Image.open('settings.png')
    settingsButton = CTkButton(master=frame1,
                               text='Settings',
                               font=('Calibri', 20),
                               text_color='#000000',
                               fg_color='transparent',
                               corner_radius=8,
                               hover_color='#DCDCDC',
                               image=CTkImage(light_image=settingsImage),
                               width=330, anchor=tk.W)
    settingsButton.place(x=30, y=200)

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
    helpButton.place(x=30, y=250)

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
    feedbackButton.place(x=30, y=300)

    logoutImage = Image.open('logout.png')
    logoutButton = CTkButton(master=frame1,
                             text='Log-out',
                             font=('Calibri', 20),
                             text_color='#000000',
                             fg_color='transparent',
                             corner_radius=8,
                             hover_color='#DCDCDC',
                             image=CTkImage(light_image=logoutImage),
                             width=330, anchor=tk.W)
    logoutButton.place(x=30, y=350)



root=CTk(fg_color='#FFFAFA')
root.title("SystemLogAI")
root.geometry("1500x800+10+20")
set_appearance_mode("light")

frame = CTkFrame(master=root,
                  fg_color='#FFFAFA',
                  height=380,
                  width=400,
                  border_width=1,
                  corner_radius=15)
frame.place(x=550,y=150)

loginLabel = CTkLabel(master=frame,
                     text_color='black',
                     text='LOG-IN',
                     font=('Calibri', 30, 'bold'),
                     bg_color='#FFFAFA')
loginLabel.place(x=160, y=40)

usernameLabel = CTkLabel(master=frame,
                     text_color='black',
                     text='Username',
                     font=('Calibri', 15),
                     bg_color='#FFFAFA')
usernameLabel.place(x=20, y=80)

usernameBox = CTkEntry(master=frame,
                     text_color='black',
                     width=360,
                     height=40,
                     border_width=1,
                     fg_color='transparent',
                     corner_radius=10,
                     font=('Calibri', 14))
usernameBox.place(x=20, y=110)

passwordLabel = CTkLabel(master=frame,
                     text_color='black',
                     text='Password',
                     font=('Calibri', 15),
                     bg_color='#FFFAFA')
passwordLabel.place(x=20, y=170)

passwordBox = CTkEntry(master=frame,
                     width=360,
                     height=40,
                     border_width=1,
                     fg_color='transparent',
                     corner_radius=10,
                     font=('Calibri', 14),
                     text_color='black')
passwordBox.place(x=20, y=200)

forgotPasswordButton = CTkButton(master=frame,
                       text='Forgot Password?',
                       font=('Calibri', 12),
                       text_color='#000000',
                       fg_color='transparent',
                       corner_radius=8,
                       hover_color='#FFFAFA',
                       width=50, anchor=tk.N)
forgotPasswordButton.place(x=285, y=240)

loginButton = CTkButton(master=frame,
                         text='Log-in',
                         font=('Calibri', 18),
                         text_color='#FFFAFA',
                         fg_color='#2e4053',
                         corner_radius=8,
                         width=360,
                         height=40,
                         command=lambda:handleLogin())
loginButton.place(x=20, y=290)

def handleLogin():


    user_name = usernameBox.get()
    password = passwordBox.get()

    url='http://localhost:5000'
    payload={
        'email': user_name,
        'password': password,
    }
    header={
        'Content-Type': "application/json"
    }
    try:
        response = requests.post(f"{url}/api/auth/login", json=payload, headers=header)


        if(response.status_code ==200):
            showMainWindow(frame)
    except Exception as e:
        print(e)
    print(response.text)
    


if __name__ == '__main__':
    root.mainloop()
