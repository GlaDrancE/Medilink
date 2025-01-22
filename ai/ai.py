import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import sklearn as sk
from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest
import time

data = pd.read_csv('data.csv')

data['login_time'] = pd.to_datetime(data['login_time']).astype(int) / 10 ** 9
data['logout_time'] = pd.to_datetime(data['logout_time']).astype(int) / 10 ** 9


features = data[['login_time', 'logout_time', 'failed_attempts']].values

model = IsolationForest(contamination=0.01)
model.fit(features)

def detect_anomly(new_event):
    is_anomly = model.predict(new_event)
    if is_anomly == -1:
        return True
    else:
        return False

new_event = [[time.time(), time.time(), 8]]
print(detect_anomly(new_event))