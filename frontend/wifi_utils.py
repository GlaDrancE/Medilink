import os
import re
import subprocess

def scan_devices():
    """
    Scan for devices on the same network using ARP.
    Returns a list of tuples containing (IP address, MAC address).
    """
    devices = []
    
    # Run the ARP command
    if os.name == "nt":  # Windows
        output = subprocess.check_output(["arp", "-a"]).decode("utf-8")
        # Parse the output
        for line in output.splitlines():
            match = re.search(r"(\d+\.\d+\.\d+\.\d+)\s+([0-9A-Fa-f-]{17})", line)
            if match:
                ip, mac = match.groups()
                devices.append((ip, mac))
    
    return devices

def is_device_connected(target_mac):
    """
    Check if a specific device is connected to the network.

    Args:
        target_mac (str): The MAC address of the target device.

    Returns:
        bool: True if the device is connected, False otherwise.
    """
    devices = scan_devices()
    # print(devices)
    for _, mac in devices:
        if mac.lower() == target_mac.lower():
            return True
    return False