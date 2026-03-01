'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import { getHealthStatsMultipleYears, getDiseaseStatsMultipleYears, getLifeExpectancyMultipleYears } from '@/lib/healthStats';
import StatCard from '@/components/dashboard/StatCard';
import InteractiveStatsCards from '@/components/dashboard/InteractiveStatsCards';
import NewsFeed from '@/components/dashboard/NewsFeed';
import HealthTrendsChart from '@/components/dashboard/HealthTrendsChart';
import DiseaseStatsChart from '@/components/dashboard/DiseaseStatsChart';
import { 
    TrendingUp, 
    Activity, 
    Heart, 
    Shield, 
    Zap, 
    Sparkles,
    Brain,
    Target,
    Globe,
    Clock,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

// Custom loading skeleton with OPTIMIZED shimmer effect
const LoadingSkeleton = () => (
    <div className="space-y-8">
        {/* Header Skeleton with OPTIMIZED shimmer */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900 to-gray-800 p-6">
            <div className="h-8 w-64 bg-gray-700 rounded-md mb-2 animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-700 rounded-md animate-pulse"></div>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gray-800/30 to-transparent animate-shimmer-slow"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800/80 p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-6 w-24 bg-gray-700 rounded-md animate-pulse"></div>
                        <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-700 rounded-lg animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-700 rounded-md animate-pulse"></div>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-green-500/5 to-transparent animate-shimmer-slow"></div>
                </div>
            ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800/80 p-6 border border-gray-800 h-96">
                    <div className="h-6 w-48 bg-gray-700 rounded-md animate-pulse mb-6"></div>
                    <div className="h-64 w-full bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-shimmer-slow"></div>
                </div>
            ))}
        </div>
    </div>
);

// Enhanced glow effect with OPTIMIZED gradient borders
const EnhancedGlowCard = ({ children, className = '', glowColor = 'green', isLoading = false }) => (
    <div className={`
        relative rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/60 
        border border-gray-700/50 backdrop-blur-sm
        transition-all duration-300 ease-out
        hover:scale-[1.01]
        ${glowColor === 'green' ? 'hover:shadow-lg hover:shadow-green-500/10' : ''}
        ${glowColor === 'blue' ? 'hover:shadow-lg hover:shadow-blue-500/10' : ''}
        ${glowColor === 'purple' ? 'hover:shadow-lg hover:shadow-purple-500/10' : ''}
        overflow-hidden
        ${className}
    `}>
        {/* OPTIMIZED Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-400/5 to-green-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500 animate-gradient-x-slow"></div>
        
        {/* Inner content */}
        <div className="relative z-10 h-full">
            {children}
        </div>
        
        {/* OPTIMIZED Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-400/30 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-400/30 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-400/30 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-400/30 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
    </div>
);

// Data refresh indicator
const RefreshIndicator = ({ lastUpdated, onRefresh, isRefreshing }) => (
    <div className="flex items-center gap-3 text-sm text-gray-400 mb-6">
        <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Last updated: {lastUpdated}</span>
        </div>
        <button 
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200 disabled:opacity-50"
        >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin-slow' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
    </div>
);

// Quick actions panel with OPTIMIZED animations
const QuickActionsPanel = () => {
    const actions = [
        { icon: <Activity size={20} />, label: 'Live Health Map', color: 'text-red-400' },
        { icon: <Shield size={20} />, label: 'Vaccination Tracker', color: 'text-blue-400' },
        { icon: <Brain size={20} />, label: 'Symptom Checker', color: 'text-purple-400' },
        { icon: <Target size={20} />, label: 'Outbreak Alerts', color: 'text-orange-400' },
    ];

    return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30 rounded-2xl border border-gray-700/50 mb-6">
            <div className="flex items-center gap-4">
                <Zap size={24} className="text-yellow-400" />
                <span className="text-white font-medium">Quick Actions</span>
            </div>
            <div className="flex gap-6">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <span className={action.color}>{action.icon}</span>
                        <span className="text-gray-300 text-sm">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

async function getDashboardData() {
    const healthStats = await getHealthStatsMultipleYears([2024, 2023, 2022, 2021, 2020, 2019]);
    const diseaseStats = await getDiseaseStatsMultipleYears([2019, 2020, 2021, 2022, 2023, 2024]);
    const lifeExpectancyStats = await getLifeExpectancyMultipleYears([2019, 2020, 2021, 2022, 2023, 2024]);

    const apiKey = process.env.NEXT_PUBLIC_GNEWS_API_KEY;
    const newsResponse = await fetch(`https://gnews.io/api/v4/top-headlines?country=in&category=health&max=6&apikey=${apiKey}`);
    const newsData = await newsResponse.json();

    return {
        stats: healthStats || [],
        diseaseStats: diseaseStats || [],
        lifeExpectancyStats: lifeExpectancyStats || [],
        news: newsData.articles || [],
    };
}

export default function DashboardPageWrapper() {
    return <DashboardWithSidebar />;
}

function DashboardWithSidebar() {
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        
        try {
            const data = await getDashboardData();
            setDashboardData(data);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setIsLoading(false);
            if (isRefresh) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = () => {
        loadData(true);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-[#010409] via-gray-900 to-[#0a0f1d] text-gray-300 font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 ml-22 overflow-y-auto p-6 lg:p-8 relative">
                {/* OPTIMIZED Animated background elements */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/3 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
                
                <div className="relative z-10">
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="space-y-8">
                            {/* Header Section */}
                            <EnhancedGlowCard glowColor="green" className="p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-green-400 bg-clip-text text-transparent">
                                            Health Intelligence
                                        </h1>
                                        <p className="text-gray-400 mt-2 flex items-center gap-2">
                                            <Sparkles size={16} className="text-green-400" />
                                            Real-time health analytics and insights for India
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                                            <span className="text-green-400 text-sm">Live Data</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <RefreshIndicator 
                                    lastUpdated={lastUpdated}
                                    onRefresh={handleRefresh}
                                    isRefreshing={isRefreshing}
                                />
                            </EnhancedGlowCard>

                            {/* Quick Actions */}
                            <QuickActionsPanel />

                            {/* Interactive Stats */}
                            <EnhancedGlowCard glowColor="blue" className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <TrendingUp size={24} className="text-blue-400" />
                                    <h2 className="text-2xl font-bold text-white">Key Health Metrics</h2>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    <InteractiveStatsCards healthStatsData={dashboardData.stats} />
                                </div>
                            </EnhancedGlowCard>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <EnhancedGlowCard glowColor="purple" className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Heart size={24} className="text-purple-400" />
                                        <h2 className="text-2xl font-bold text-white">Health Trends</h2>
                                    </div>
                                    <HealthTrendsChart lifeExpectancyData={dashboardData.lifeExpectancyStats} />
                                </EnhancedGlowCard>

                                <EnhancedGlowCard glowColor="orange" className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <AlertCircle size={24} className="text-orange-400" />
                                        <h2 className="text-2xl font-bold text-white">Disease Statistics</h2>
                                    </div>
                                    <DiseaseStatsChart diseaseData={dashboardData.diseaseStats} />
                                </EnhancedGlowCard>
                            </div>

                            {/* News Feed */}
                            <EnhancedGlowCard glowColor="green" className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <Globe size={24} className="text-green-400" />
                                    <h2 className="text-2xl font-bold text-white">Health News Updates</h2>
                                </div>
                                <NewsFeed newsItems={dashboardData.news} isLoading={false} />
                            </EnhancedGlowCard>
                        </div>
                    )}
                </div>
            </main>

            {/* OPTIMIZED Custom CSS for slower, more performant animations */}
            <style jsx>{`
                @keyframes shimmer-slow {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes gradient-x-slow {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.1; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-shimmer-slow {
                    animation: shimmer-slow 4s infinite;
                }
                .animate-gradient-x-slow {
                    background-size: 200% 200%;
                    animation: gradient-x-slow 6s ease infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite;
                }
                .animate-spin-slow {
                    animation: spin-slow 1.5s linear infinite;
                }
            `}</style>
        </div>
    );
}