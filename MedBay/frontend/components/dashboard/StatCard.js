'use client';

const StatCard = ({ icon, title, value, change }) => {
    const isPositive = change && change.startsWith('+');
    const changeColor = isPositive ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="text-green-400">{icon}</div>
                <div>
                    <p className="text-sm text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {change && (
                        <p className={`text-xs font-semibold ${changeColor}`}>{change} vs last year</p>
                    )}
                </div>
            </div>
        </div>
    );
};
export default StatCard;