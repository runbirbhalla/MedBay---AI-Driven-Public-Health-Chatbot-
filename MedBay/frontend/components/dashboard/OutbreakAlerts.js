// frontend/components/dashboard/OutbreakAlerts.js
'use client';

const OutbreakAlerts = ({ alerts }) => {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'high alert': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'monitoring': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Regional Outbreak Alerts</h3>
            <ul className="space-y-3">
                {alerts.map((alert, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-900 p-3 rounded-md border border-gray-800">
                        <div>
                            <p className="font-semibold text-white">{alert.disease}</p>
                            <p className="text-sm text-gray-400">{alert.state}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(alert.status)}`}>
                            {alert.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default OutbreakAlerts;