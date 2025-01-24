import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

# Train the Isolation Forest model
try:
    data = pd.read_csv('data.csv')

    # Convert login/logout times to Unix timestamps
    data['login_time'] = pd.to_datetime(data['login_time']).astype('int64') / 10 ** 9
    data['logout_time'] = pd.to_datetime(data['logout_time']).astype('int64') / 10 ** 9

    # Extract features for the model
    features = data[['login_time', 'logout_time', 'failed_attempts']].values

    # Train the Isolation Forest model
    model = IsolationForest(contamination=0.01)
    model.fit(features)
    print("Isolation Forest model trained successfully.")
except Exception as e:
    print(f"Error loading or training the model: {e}")


def detect_anomaly(event):
    """
    Detect if a new event is an anomaly using the Isolation Forest model.

    Parameters:
        event: List containing [login_time, logout_time, failed_attempts]

    Returns:
        bool: True if an anomaly is detected, False otherwise
    """
    try:
        is_anomaly = model.predict(event)
        return is_anomaly[0] == -1  # Return True if anomaly is detected
    except Exception as e:
        print(f"Error during anomaly detection: {e}")
        return False
