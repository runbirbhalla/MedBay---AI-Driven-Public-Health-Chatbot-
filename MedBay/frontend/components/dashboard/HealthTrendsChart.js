'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HealthTrendsChart = ({ lifeExpectancyData }) => {
    // Prepare chart data from life expectancy data
    const getChartData = () => {
        const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
        
        // Aggregate data by year (since we have multiple countries)
        const yearlyData = years.map(year => {
            const yearRecords = lifeExpectancyData.filter(record => record.year === parseInt(year));
            
            if (yearRecords.length === 0) {
                return { year, maleAvg: null, femaleAvg: null };
            }
            
            // Calculate average life expectancy for the year (excluding null values)
            const validMaleRecords = yearRecords.filter(r => r.life_expectancy_male_years !== null);
            const validFemaleRecords = yearRecords.filter(r => r.life_expectancy_female_years !== null);
            
            const maleAvg = validMaleRecords.length > 0 
                ? validMaleRecords.reduce((sum, r) => sum + r.life_expectancy_male_years, 0) / validMaleRecords.length
                : null;
            
            const femaleAvg = validFemaleRecords.length > 0 
                ? validFemaleRecords.reduce((sum, r) => sum + r.life_expectancy_female_years, 0) / validFemaleRecords.length
                : null;
            
            return {
                year,
                maleAvg: maleAvg ? parseFloat(maleAvg.toFixed(1)) : null,
                femaleAvg: femaleAvg ? parseFloat(femaleAvg.toFixed(1)) : null
            };
        });
        
        return {
            labels: years,
            datasets: [
                {
                    label: 'Male Life Expectancy (Years)',
                    data: yearlyData.map(d => d.maleAvg),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#1e40af',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Female Life Expectancy (Years)',
                    data: yearlyData.map(d => d.femaleAvg),
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#ec4899',
                    pointBorderColor: '#be185d',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    tension: 0.3,
                    fill: false
                }
            ]
        };
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                position: 'top', 
                labels: { 
                    color: '#9ca3af',
                    font: { size: 12 },
                    usePointStyle: true,
                    pointStyle: 'circle'
                } 
            },
            title: { 
                display: true, 
                text: 'Global Average Life Expectancy Trends (2019-2024)', 
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
                        if (value === null) {
                            return `${context.dataset.label}: No data available`;
                        }
                        return `${context.dataset.label}: ${value} years`;
                    }
                }
            }
        },
        scales: {
            x: { 
                ticks: { 
                    color: '#9ca3af',
                    font: { size: 11 }
                }, 
                grid: { 
                    color: '#374151',
                    drawOnChartArea: false 
                },
                title: {
                    display: true,
                    text: 'Year',
                    color: '#9ca3af',
                    font: { size: 12 }
                }
            },
            y: { 
                ticks: { 
                    color: '#9ca3af',
                    font: { size: 11 },
                    callback: function(value) {
                        return value + ' years';
                    }
                }, 
                grid: { 
                    color: '#374151' 
                },
                title: {
                    display: true,
                    text: 'Life Expectancy (Years)',
                    color: '#9ca3af',
                    font: { size: 12 }
                },
                beginAtZero: false,
                min: 60  // Start from 60 years for better visualization
            }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    return (
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 h-96">
            <Line options={options} data={getChartData()} />
        </div>
    );
};
export default HealthTrendsChart;
