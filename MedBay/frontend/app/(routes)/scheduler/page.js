'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Clock, Calendar, Bell, Search, Filter } from 'lucide-react';
import MedicineCard from '@/components/scheduler/MedicineCard';
import MedicineFormModal from '@/components/scheduler/MedicineFormModal';
import { getSchedules, addSchedule, deleteSchedule } from './actions';
import Sidebar from '@/components/sidebar';

export default function SchedulerPage() {
    const [schedules, setSchedules] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    // Load schedules from database
    const loadSchedules = async () => {
        setIsLoading(true);
        const { data, error } = await getSchedules();
        if (error) {
            console.error("Failed to load schedules:", error.message);
            // Using toast notification instead of alert for better UX
            showNotification('error', 'Could not load schedules from the database.');
        } else {
            setSchedules(data || []);
            setFilteredSchedules(data || []);
        }
        setIsLoading(false);
    };

    // Filter schedules based on search and filter criteria
    useEffect(() => {
        let filtered = schedules;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(schedule =>
                schedule.medicine_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule.dosage?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (activeFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(schedule => {
                const scheduleTime = new Date(schedule.schedule_time);
                if (activeFilter === 'upcoming') return scheduleTime > now;
                if (activeFilter === 'past') return scheduleTime <= now;
                return true;
            });
        }

        setFilteredSchedules(filtered);
    }, [schedules, searchTerm, activeFilter]);

    useEffect(() => {
        loadSchedules();
    }, []);

    const handleSaveSchedule = async (scheduleData) => {
        const { error } = await addSchedule(scheduleData);
        if (error) {
            showNotification('error', 'Could not save schedule.');
        } else {
            showNotification('success', 'Schedule added successfully!');
            loadSchedules();
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this reminder?')) {
            const { error } = await deleteSchedule(id);
            if (error) {
                showNotification('error', 'Could not delete schedule.');
            } else {
                showNotification('success', 'Schedule deleted successfully!');
                loadSchedules();
            }
        }
    };

    const showNotification = (type, message) => {
        // You can replace this with a proper toast notification library
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white font-medium`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    };

    const getStats = () => {
        const now = new Date();
        const total = schedules.length;
        const upcoming = schedules.filter(s => new Date(s.schedule_time) > now).length;
        const past = total - upcoming;
        
        return { total, upcoming, past };
    };

    const stats = getStats();

    return (
        <>
            <MedicineFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSchedule}
            />
            
            <Sidebar />
            
            <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6 lg:p-28 overflow-y-auto">
                {/* Header Section */}
                <header className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                        <div className="mb-4 lg:mb-0">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                Automated Reminders
                            </h1>
                            <p className="text-gray-400 mt-2 flex items-center gap-2">
                                <Bell size={16} />
                                Schedules are saved to the database for automatic SMS alerts
                            </p>
                        </div>
                        
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transform hover:-translate-y-0.5"
                        >
                            <PlusCircle size={20} />
                            <span className="font-semibold">Add Reminder</span>
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Total Reminders</p>
                                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                                </div>
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Calendar size={20} className="text-blue-400" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Upcoming</p>
                                    <p className="text-2xl font-bold text-green-400">{stats.upcoming}</p>
                                </div>
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Clock size={20} className="text-green-400" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">Completed</p>
                                    <p className="text-2xl font-bold text-gray-400">{stats.past}</p>
                                </div>
                                <div className="p-2 bg-gray-500/20 rounded-lg">
                                    <Clock size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by medicine name or dosage..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            {[
                                { key: 'all', label: 'All', count: stats.total },
                                { key: 'upcoming', label: 'Upcoming', count: stats.upcoming },
                                { key: 'past', label: 'Completed', count: stats.past }
                            ].map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                                        activeFilter === filter.key
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:border-gray-600/50'
                                    }`}
                                >
                                    <Filter size={16} />
                                    <span>{filter.label}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        activeFilter === filter.key ? 'bg-green-500/30' : 'bg-gray-700/50'
                                    }`}>
                                        {filter.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Content Section */}
                <main className="flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                            <p className="text-gray-400 text-lg">Loading your reminders...</p>
                        </div>
                    ) : filteredSchedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 max-w-md">
                                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {searchTerm || activeFilter !== 'all' ? 'No matching reminders' : 'No reminders scheduled'}
                                </h3>
                                <p className="text-gray-400 mb-4">
                                    {searchTerm || activeFilter !== 'all' 
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'Get started by creating your first medication reminder.'
                                    }
                                </p>
                                <button 
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Create Reminder
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-gray-400">
                                    Showing {filteredSchedules.length} of {schedules.length} reminders
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredSchedules.map(schedule => (
                                    <MedicineCard 
                                        key={schedule.id} 
                                        medicine={schedule}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </main>
            </div>
        </>
    );
}