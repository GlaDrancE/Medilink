from customtkinter import *            #pip install customtkinter
import customtkinter as ctk
from PIL import Image
import tkinter as tk

def display(frame2):
    displayLabel = CTkLabel(master=frame2,
                            text_color='black',
                             text='Dashboard',
                             font=('Calibri', 39, 'bold'),
                            fg_color='transparent',
                             bg_color='transparent')
    displayLabel.place(x=50, y=40)

    welcomeLabel = CTkLabel(master=frame2,
                            text_color='grey',
                            text='Welcome to System Log AI',
                            font=('Calibri', 15),
                            fg_color='transparent',
                            bg_color='transparent')
    welcomeLabel.place(x=52, y=90)
    
    searchImage = Image.open('search.png')
    searchLabel = CTkLabel(master=frame2,
                           height=50,
                           width=50,
                           image=CTkImage(light_image=searchImage),
                           text="",
                           fg_color='transparent',
                           corner_radius=10)
    searchLabel.place(x=50, y=140)
    
    searchBox = CTkEntry(master=frame2,
                         width=980,
                         height=50,
                         border_width=1,
                         fg_color='transparent',
                         placeholder_text="Search here....",
                         corner_radius=10,
                         font=('Calibri', 14))
    searchBox.place(x=100, y=140)

    overviewLabel = CTkLabel(master=frame2,
                             text_color='black',
                             text='Summary',
                             font=('Calibri', 39, 'bold'),
                             bg_color='#FFFAFA')
    overviewLabel.place(x=50, y=250)

    loginsOverviewFrame = CTkFrame(master=frame2,
                                   height=150,
                                   width=150,
                                   border_width=1,
                                   fg_color='#FFFAFA',
                                   corner_radius=15)
    loginsOverviewFrame.place(x=300, y=350)
    loginsLabel = CTkLabel(master=loginsOverviewFrame,
                             text_color='black',
                             text='Logins',
                             font=('Calibri', 15),
                             bg_color='#FFFAFA')
    loginsLabel.place(x=50, y=10)



    logoutsOverviewFrame = CTkFrame(master=frame2,
                                    height=150,
                                    width=150,
                                    border_width=1,
                                    fg_color='#FFFAFA',
                                    corner_radius=15)
    logoutsOverviewFrame.place(x=500, y=350)
    logoutsLabel = CTkLabel(master=logoutsOverviewFrame,
                             text_color='black',
                             text='Logouts',
                             font=('Calibri', 15),
                             bg_color='#FFFAFA')
    logoutsLabel.place(x=50, y=10)

    warningsOverviewFrame = CTkFrame(master=frame2,
                                    height=150,
                                    width=150,
                                    border_width=1,
                                    fg_color='#FFFAFA',
                                    corner_radius=15)
    warningsOverviewFrame.place(x=700, y=350)
    warningsLabel = CTkLabel(master=warningsOverviewFrame,
                             text_color='black',
                             text='Warnings',
                             font=('Calibri', 15),
                             bg_color='#FFFAFA')
    warningsLabel.place(x=45, y=10)

    activityLabel = CTkLabel(master=frame2,
                             text_color='black',
                             text='Activity',
                             font=('Calibri', 39, 'bold'),
                             bg_color='#FFFAFA')
    activityLabel.place(x=50, y=550)

    
