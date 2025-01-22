import wmi

def track_usb_events():
    c = wmi.WMI()
    
    # Watch for USB device insertions and removals
    usb_insert = c.watch_for(notification_type="Creation", wmi_class="Win32_USBControllerDevice")
    usb_remove = c.watch_for(notification_type="Deletion", wmi_class="Win32_USBControllerDevice")
    
    print("Monitoring USB events... (Press Ctrl+C to stop)")
    
    while True:
        try:
            inserted_device = usb_insert()
            print("USB Device Inserted:", inserted_device.Dependent)
            
            removed_device = usb_remove()
            print("USB Device Removed:", removed_device.Dependent)
        except KeyboardInterrupt:
            print("\nStopping USB event monitoring.")
            break

if __name__ == "__main__":
    track_usb_events()
