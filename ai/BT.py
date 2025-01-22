import asyncio
from bleak import BleakScanner
import ctypes
import time

# Phone Bluetooth MAC Address (Replace with actual MAC)
PHONE_MAC_ADDRESS = ""

# Function to Check Bluetooth Connection
async def is_phone_connected():
    devices = await BleakScanner.discover()
    for device in devices:
        print(device.name)
        print(device.address)
        # if device.address == PHONE_MAC_ADDRESS:
        #     return True
    return False

# Function to Log Out User
def log_out_user():
    #ctypes.windll.user32.LockWorkStation()
    print("User logged out.")

# connected = is_phone_connected()
# Main Monitoring Loop
async def monitor_bluetooth():
    print("Monitoring Bluetooth connection...")
    try:
        while True:
            connected = await is_phone_connected()
            if not connected:
                print("Phone disconnected! Logging out...")
                log_out_user()
                break
            else:
                print("Phone connected.")
            time.sleep(10)  # Check every 10 seconds
    except KeyboardInterrupt:
        print("Monitoring stopped.")

# # Run the Monitoring Loop
asyncio.run(monitor_bluetooth())