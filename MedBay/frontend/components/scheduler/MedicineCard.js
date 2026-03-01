'use client';
import { Pill, Clock, Trash2, Repeat } from 'lucide-react';

const MedicineCard = ({ medicine, onDelete }) => {
    const formattedDateTime = new Date(medicine.scheduled_at).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    // Safely determine the recurring text, defaulting to 'Once'
    const recurringText = medicine.recurring_type
        ? medicine.recurring_type.charAt(0).toUpperCase() + medicine.recurring_type.slice(1)
        : 'Once';

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center gap-3">
                    <Pill className="h-6 w-6 text-green-400 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-white">{medicine.medicine_name}</h3>
                        <p className="text-sm text-gray-400">{medicine.dosage}</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-gray-300">
                    <Clock size={16} />
                    <p className="text-sm font-semibold">Next: {formattedDateTime}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-gray-400">
                    <Repeat size={16} />
                    <p className="text-sm font-semibold">{recurringText}</p>
                </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => onDelete(medicine.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors" aria-label="Delete medicine">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};
export default MedicineCard;