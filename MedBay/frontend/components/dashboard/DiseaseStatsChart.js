'use client';

import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DiseaseStatsChart = ({ diseaseData }) => {
    const [selectedDisease, setSelectedDisease] = useState('hiv');

    // Define disease options
    const diseaseOptions = [
        { value: 'hiv', label: 'HIV Prevalence Rate', field: 'hiv_prevalence_rate', color: '#f59e0b', unit: '%' },
        { value: 'tb', label: 'TB Incidence Rate', field: 'tb_incidence_rate', color: '#ef4444', unit: ' per 100k' }
    ];

    const currentDisease = diseaseOptions.find(d => d.value === selectedDisease);

    // Prepare chart data
    const getChartData = () => {
        const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
        
        // Extract data for the selected disease across years
        const data = years.map(year => {
            const yearData = diseaseData.find(d => d.year === parseInt(year));
            if (!yearData) {
                return 0;
            }
            
            const value = yearData[currentDisease.field];
            const processedValue = (value !== null && value !== undefined && value !== -1) ? value : 0;
            
            return processedValue;
        });

        return {
            labels: years,
            datasets: [{
                label: `${currentDisease.label}${currentDisease.unit}`,
                data: data,
                backgroundColor: currentDisease.color + '80', // Add transparency
                borderColor: currentDisease.color,
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top', 
                labels: { color: '#9ca3af', font: { size: 12 } }
            },
            title: { 
                display: true, 
                text: `${currentDisease.label} Trend (2019-2024)`, 
                color: '#e5e7eb', 
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#e5e7eb',
                bodyColor: '#9ca3af',
                borderColor: '#374151',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y;
                        if (value === 0) {
                            return `${context.dataset.label}: No data available`;
                        }
                        return `${context.dataset.label}: ${value.toLocaleString()}`;
                    }
                }
            }
        },
        scales: {
            x: { 
                ticks: { color: '#9ca3af', font: { size: 11 } }, 
                grid: { color: '#374151', drawOnChartArea: false }
            },
            y: { 
                ticks: { 
                    color: '#9ca3af', 
                    font: { size: 11 },
                    callback: function(value) {
                        return value.toLocaleString();
                    }
                }, 
                grid: { color: '#374151' },
                beginAtZero: true
            }
        },
        animation: {
            duration: 800,
            easing: 'easeInOutQuart'
        }
    };

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 h-96">
            {/* Dropdown for disease selection */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Disease Statistics</h3>
                <select 
                    value={selectedDisease}
                    onChange={(e) => setSelectedDisease(e.target.value)}
                    className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                    {diseaseOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Chart container */}
            <div className="h-80">
                <Bar options={chartOptions} data={getChartData()} />
            </div>
        </div>
    );
};

export default DiseaseStatsChart;