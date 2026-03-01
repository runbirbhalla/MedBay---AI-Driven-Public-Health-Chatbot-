'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react'; // Import the close icon

const MedicineFormModal = ({ isOpen, onClose, onSave }) => {
    // You should use a simple time input for scheduledAt for daily/weekly/monthly recurrence.
    // The date input is only truly necessary for 'once' recurrence.
    const today = new Date().toISOString().split('T')[0];
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [date, setDate] = useState(today); // Today's date as default
    const [time, setTime] = useState('09:00');
    const [phone, setPhone] = useState(''); // Changed default from '+91' to empty for cleaner input
    const [recurring, setRecurring] = useState('daily'); // Changed default to 'daily'

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // For daily/weekly/monthly, we only care about the time component. 
        // We use the current date to combine with the time, resulting in a full ISO timestamp.
        let dateToSchedule = today; 
        if (recurring === 'once') {
            // Only use the selected date if the recurrence is 'once'
            dateToSchedule = date;
        }

        const scheduledAt = new Date(`${dateToSchedule}T${time}`).toISOString();
        
        // Basic phone number formatting/validation for the action function
        const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`;

        onSave({ 
            name, 
            dosage, 
            scheduledAt, 
            phone: formattedPhone, 
            recurring 
        });
        
        // Reset state and close modal
        setName('');
        setDosage('');
        setDate(today);
        setTime('09:00');
        setPhone('');
        setRecurring('daily');
        onClose();
    };

    const isDateVisible = recurring === 'once';

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 w-full max-w-lg m-4 relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>
                
                <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Schedule New Reminder</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Medicine Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Medicine Name</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Crocin, Polio Drop" />
                    </div>
                    
                    {/* Dosage */}
                    <div>
                        <label htmlFor="dosage" className="block text-sm font-medium text-gray-300">Dosage (e.g., 1 tablet)</label>
                        <input id="dosage" type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} required className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., 500mg, 5ml" />
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300">Recipient Phone Number (10 digits for SMS)</label>
                        <div className="flex mt-1">
                            <span className="inline-flex items-center px-3 bg-gray-700 border border-r-0 border-gray-700 rounded-l-lg text-gray-300 text-sm">+91</span>
                            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="9876543210" pattern="[0-9]{10}" maxLength="10" className="flex-1 w-full bg-gray-800 border border-gray-700 rounded-r-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>
                    
                    {/* Frequency */}
                    <div>
                        <label htmlFor="recurring" className="block text-sm font-medium text-gray-300">Frequency</label>
                        <select id="recurring" value={recurring} onChange={(e) => setRecurring(e.target.value)} className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="once">Once</option>
                        </select>
                    </div>
                    
                    {/* Date and Time */}
                    <div className="flex gap-4">
                        <div className={`flex-1 ${isDateVisible ? '' : 'opacity-50 pointer-events-none'}`}>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300">Date (Only for 'Once')</label>
                            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required={isDateVisible} min={today} className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="time" className="block text-sm font-medium text-gray-300">Time</label>
                            <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors shadow-md shadow-green-500/20">Schedule Reminder</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default MedicineFormModal;