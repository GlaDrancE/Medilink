import asyncio
from bleak import BleakScanner
from bleak.exc import BleakError


async def scan_devices():
    """
    Scan for nearby Bluetooth devices.
    Returns a list of tuples containing (device name, Bluetooth address).
    If Bluetooth is off, return an empty list.
    """
    devices = []
    scanner = BleakScanner()

    try:
        print("Scanning for Bluetooth devices...")
        discovered_devices = await scanner.discover(timeout=20.0)  # Increase timeout to 20 seconds

        for device in discovered_devices:
            device_name = device.name if device.name else "Unknown Device"
            devices.append((device_name, device.address))

        if not devices:
            print("No devices found.")

    except BleakError as e:
        print(f"Error during Bluetooth scan: {e}")
        # Return an empty list to indicate no devices found
        return []

    return devices


async def is_device_connected(target_mac):
    """
    Check if a specific Bluetooth device is nearby.

    Args:
        target_mac (str): The MAC address of the target device.

    Returns:
        bool: True if the device is nearby, False otherwise.
    """
    # print(f"Checking if device {target_mac} is connected...")
    devices = await scan_devices()
    
    # Normalize target MAC address
    normalized_target_mac = target_mac.lower().replace("-", ":")
    
    for _, mac in devices:
        normalized_mac = mac.lower().replace("-", ":")
        # print(f"Comparing {normalized_mac} with {normalized_target_mac}")
        
        if normalized_mac == normalized_target_mac:
            print(f"Device {target_mac} is connected!")
            return True

    print(f"Device {target_mac} is not connected.")
    return False


# Synchronous wrapper for async functions
def scan_devices_sync():
    return asyncio.run(scan_devices())

def is_device_connected_sync(target_mac):
    return asyncio.run(is_device_connected(target_mac))
