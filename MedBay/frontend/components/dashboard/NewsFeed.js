'use client';

const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NewsFeed = ({ newsItems, isLoading }) => {
    // Function to truncate description to approximately 2 lines
    const truncateDescription = (description, maxLength = 120) => {
        if (!description) return 'No description available.';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength).trim() + '...';
    };

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 h-full">
            <h3 className="text-xl font-bold text-white mb-6">Latest Health News</h3>
            {isLoading ? (
                <div className="text-center text-gray-400">Loading news...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsItems.map((item, index) => (
                        <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block group"
                            >
                                <h4 className="text-sm font-semibold text-gray-200 group-hover:text-green-400 transition-colors mb-3 leading-tight">
                                    {item.title}
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
                                    {truncateDescription(item.description)}
                                </p>
                            </a>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span className="font-medium">{item.source.name}</span>
                                <span>{timeSince(item.publishedAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default NewsFeed;