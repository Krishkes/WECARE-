import React from 'react';
import { X } from 'lucide-react';
import { Button } from "./ui/button"; // Assuming your button component is in ../ui/button

const Menu = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-80 h-full p-6 shadow-lg">
        <div className="flex justify-end mb-4">
          <Button variant="ghost" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="space-y-4">
          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Health</h3>
            <Button variant="ghost" className="w-full justify-start pl-4">Medicine Reminders</Button>
            <Button variant="ghost" className="w-full justify-start pl-4">Health Tracking</Button>
            <Button variant="ghost" className="w-full justify-start pl-4">Wellness Guidance</Button>
            {/* Future Health Options */}
            {/* <Button variant="ghost" className="w-full justify-start pl-4">Appointments</Button> */}
            {/* <Button variant="ghost" className="w-full justify-start pl-4">Medication History</Button> */}
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Social</h3>
            <Button variant="ghost" className="w-full justify-start pl-4">Connect with Family</Button>
            <Button variant="ghost" className="w-full justify-start pl-4">Messages</Button>
            <Button variant="ghost" className="w-full justify-start pl-4">Video Calls</Button>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Account</h3>
            <Button variant="ghost" className="w-full justify-start pl-4">Profile</Button>
            <Button variant="ghost" className="w-full justify-start pl-4">Settings</Button>
            <Button variant="ghost" className="w-full justify-start pl-4">Help & Support</Button>
            <Button variant="ghost" className="w-full justify-start pl-4 text-red-500">Logout</Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Menu;