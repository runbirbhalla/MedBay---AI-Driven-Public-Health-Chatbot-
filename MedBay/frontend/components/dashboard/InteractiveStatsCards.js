'use client';

import { useState, useEffect } from 'react';
import { Activity, HeartHandshake, Baby, Target } from 'lucide-react';
import { calculateAverageLifeExpectancy, calculateHealthServiceCoverage } from '@/lib/healthStats';

const InteractiveStatsCards = ({ healthStatsData }) => {
    const [selectedCountry, setSelectedCountry] = useState('India');
    const [selectedYear, setSelectedYear] = useState('2021');
    const [filteredData, setFilteredData] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Get unique countries and years from the data
    const allCountries = [...new Set(healthStatsData.map(item => item.country_name))].sort();
    const allYears = [...new Set(healthStatsData.map(item => item.year))].sort((a, b) => b - a);

    // Get available years for selected country
    const availableYears = selectedCountry 
        ? [...new Set(healthStatsData
            .filter(item => item.country_name === selectedCountry)
            .map(item => item.year))]
            .sort((a, b) => b - a)
        : allYears;

    // Get available countries for selected year
    const availableCountries = selectedYear 
        ? [...new Set(healthStatsData
            .filter(item => item.year === parseInt(selectedYear))
            .map(item => item.country_name))]
            .sort()
        : allCountries;

    // Initialize with India as default country if available
    useEffect(() => {
        if (allCountries.length > 0 && !isInitialized) {
            const indiaExists = allCountries.includes('India');
            if (indiaExists) {
                setSelectedCountry('India');
                // Also ensure we have a valid year for India
                const indiaYears = healthStatsData
                    .filter(item => item.country_name === 'India')
                    .map(item => item.year)
                    .sort((a, b) => b - a);
                if (indiaYears.length > 0 && !indiaYears.includes(parseInt(selectedYear))) {
                    setSelectedYear(indiaYears[0].toString());
                }
            } else {
                setSelectedCountry(allCountries[0]);
            }
            setIsInitialized(true);
        }
    }, [allCountries, healthStatsData, isInitialized, selectedYear]);

    // Validate and adjust selections when data changes
    useEffect(() => {
        if (selectedCountry && !availableCountries.includes(selectedCountry)) {
            // If selected country is not available for current year, pick first available
            if (availableCountries.length > 0) {
                setSelectedCountry(availableCountries[0]);
            }
        }
    }, [selectedCountry, availableCountries]);

    useEffect(() => {
        if (selectedYear && !availableYears.includes(parseInt(selectedYear))) {
            // If selected year is not available for current country, pick first available
            if (availableYears.length > 0) {
                setSelectedYear(availableYears[0].toString());
            }
        }
    }, [selectedYear, availableYears]);

    // Filter data based on selected country and year
    useEffect(() => {
        if (selectedCountry && selectedYear) {
            const data = healthStatsData.find(
                item => item.country_name === selectedCountry && item.year === parseInt(selectedYear)
            );
            setFilteredData(data || null);
        }
    }, [selectedCountry, selectedYear, healthStatsData]);

    // Calculate metrics from the filtered data
    const getStatsData = () => {
        if (!filteredData) {
            return [
                { title: 'Life Expectancy', value: 'N/A', icon: <Activity size={24} /> },
                { title: 'Maternal Mortality Ratio', value: 'N/A', icon: <HeartHandshake size={24} /> },
                { title: 'Child Mortality (Under 5)', value: 'N/A', icon: <Baby size={24} /> },
                { title: 'Health Service Coverage', value: 'N/A', icon: <Target size={24} /> },
            ];
        }

        const lifeExpectancy = calculateAverageLifeExpectancy(
            filteredData.life_expectancy_male_years,
            filteredData.life_expectancy_female_years
        );

        const healthCoverage = calculateHealthServiceCoverage(
            filteredData.antenatal_care_coverage_percent,
            filteredData.births_by_skilled_personnel_percent
        );

        return [
            {
                title: 'Life Expectancy',
                value: `${lifeExpectancy || 'N/A'} Yrs`,
                icon: <Activity size={24} />
            },
            {
                title: 'Maternal Mortality Ratio',
                value: `${filteredData.maternal_mortality_ratio || 'N/A'} / 100k`,
                icon: <HeartHandshake size={24} />
            },
            {
                title: 'Child Mortality (Under 5)',
                value: `${filteredData.under_5_mortality_rate || 'N/A'} / 1k`,
                icon: <Baby size={24} />
            },
            {
                title: 'Health Service Coverage',
                value: `${healthCoverage || 'N/A'}%`,
                icon: <Target size={24} />
            },
        ];
    };

    const statsData = getStatsData();

    return (
        <div className="lg:col-span-4 space-y-6">
            {/* Controls Section */}
            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <h3 className="text-lg font-semibold text-white">Health Statistics</h3>
                    <div className="flex flex-col sm:flex-row gap-3 ml-auto">
                        <div className="flex items-center gap-2">
                            <label htmlFor="country-select" className="text-sm text-gray-400">Country:</label>
                            <select
                                id="country-select"
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[180px]"
                            >
                                {availableCountries.map(country => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <label htmlFor="year-select" className="text-sm text-gray-400">Year:</label>
                            <select
                                id="year-select"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                {availableYears.map(year => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                {selectedCountry && selectedYear && (
                    <p className="text-xs text-gray-500 mt-2">
                        Showing data for {selectedCountry} in {selectedYear}
                    </p>
                )}
            </div>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsData.map((stat, index) => (
                    <div key={index} className="bg-gray-900/50 p-6 rounded-lg border border-gray-800 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="text-green-400">{stat.icon}</div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-400">{stat.title}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InteractiveStatsCards;