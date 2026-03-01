import { supabase } from './supabaseClient';

/**
 * Fetch WHO health statistics from Supabase
 * @param {number} year - The year to fetch data for (default: 2024)
 * @param {string} country - The country to fetch data for (optional)
 * @returns {Object} Health statistics data
 */
export async function getHealthStats(year = 2024, country = null) {
  try {
    let query = supabase
      .from('who_health_statistics')
      .select(`
        year,
        country_name,
        life_expectancy_male_years,
        life_expectancy_female_years,
        maternal_mortality_ratio,
        under_5_mortality_rate,
        antenatal_care_coverage_percent,
        births_by_skilled_personnel_percent
      `)
      .eq('year', year);

    if (country) {
      query = query.eq('country_name', country);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error('Error fetching health stats:', error);
      return null;
    }

    if (!data) return null;

    // Process data to treat -1 values as null
    const processedData = {
      ...data,
      life_expectancy_male_years: data.life_expectancy_male_years === -1 ? null : data.life_expectancy_male_years,
      life_expectancy_female_years: data.life_expectancy_female_years === -1 ? null : data.life_expectancy_female_years,
      maternal_mortality_ratio: data.maternal_mortality_ratio === -1 ? null : data.maternal_mortality_ratio,
      under_5_mortality_rate: data.under_5_mortality_rate === -1 ? null : data.under_5_mortality_rate,
      antenatal_care_coverage_percent: data.antenatal_care_coverage_percent === -1 ? null : data.antenatal_care_coverage_percent,
      births_by_skilled_personnel_percent: data.births_by_skilled_personnel_percent === -1 ? null : data.births_by_skilled_personnel_percent
    };

    return processedData;
  } catch (error) {
    console.error('Error in getHealthStats:', error);
    return null;
  }
}

/**
 * Fetch WHO health statistics for multiple years to calculate changes
 * @param {Array} years - Array of years to fetch data for
 * @param {string} country - The country to fetch data for (optional)
 * @returns {Array} Array of health statistics data
 */
export async function getHealthStatsMultipleYears(years = [2024, 2023], country = null) {
  try {
    let query = supabase
      .from('who_health_statistics')
      .select(`
        year,
        country_name,
        life_expectancy_male_years,
        life_expectancy_female_years,
        maternal_mortality_ratio,
        under_5_mortality_rate,
        antenatal_care_coverage_percent,
        births_by_skilled_personnel_percent
      `)
      .in('year', years)
      .order('year', { ascending: false });

    if (country) {
      query = query.eq('country_name', country);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching health stats:', error);
      return [];
    }

    // Process data to treat -1 values as null
    const processedData = (data || []).map(record => ({
      ...record,
      life_expectancy_male_years: record.life_expectancy_male_years === -1 ? null : record.life_expectancy_male_years,
      life_expectancy_female_years: record.life_expectancy_female_years === -1 ? null : record.life_expectancy_female_years,
      maternal_mortality_ratio: record.maternal_mortality_ratio === -1 ? null : record.maternal_mortality_ratio,
      under_5_mortality_rate: record.under_5_mortality_rate === -1 ? null : record.under_5_mortality_rate,
      antenatal_care_coverage_percent: record.antenatal_care_coverage_percent === -1 ? null : record.antenatal_care_coverage_percent,
      births_by_skilled_personnel_percent: record.births_by_skilled_personnel_percent === -1 ? null : record.births_by_skilled_personnel_percent
    }));

    return processedData;
  } catch (error) {
    console.error('Error in getHealthStatsMultipleYears:', error);
    return [];
  }
}

/**
 * Calculate average life expectancy from male and female values
 * @param {number} maleLE - Male life expectancy
 * @param {number} femaleLE - Female life expectancy
 * @returns {number} Average life expectancy
 */
export function calculateAverageLifeExpectancy(maleLE, femaleLE) {
  if (!maleLE || !femaleLE) return null;
  return ((maleLE + femaleLE) / 2).toFixed(1);
}

/**
 * Calculate health service coverage from available indicators
 * @param {number} antenatalCoverage - Antenatal care coverage percentage
 * @param {number} skilledBirthCoverage - Births by skilled personnel percentage
 * @returns {number} Health service coverage estimate
 */
export function calculateHealthServiceCoverage(antenatalCoverage, skilledBirthCoverage) {
  if (!antenatalCoverage || !skilledBirthCoverage) return null;
  return ((antenatalCoverage + skilledBirthCoverage) / 2).toFixed(1);
}

/**
 * Fetch disease statistics (HIV, TB, Polio) for multiple years
 * @param {Array} years - Array of years to fetch data for
 * @param {string} country - The country to fetch data for (optional)
 * @returns {Array} Array of disease statistics data
 */
export async function getDiseaseStatsMultipleYears(years = [2019, 2020, 2021, 2022, 2023, 2024], country = null) {
  try {
    let query = supabase
      .from('who_health_statistics')
      .select(`
        year,
        country_name,
        hiv_prevalence_rate,
        tb_incidence_rate,
        polio_cases
      `)
      .in('year', years)
      .order('year', { ascending: true });

    if (country) {
      query = query.eq('country_name', country);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching disease stats:', error);
      return [];
    }

    // Process data to treat -1 values as null
    const processedData = (data || []).map(record => ({
      ...record,
      hiv_prevalence_rate: record.hiv_prevalence_rate === -1 ? null : record.hiv_prevalence_rate,
      tb_incidence_rate: record.tb_incidence_rate === -1 ? null : record.tb_incidence_rate,
      polio_cases: record.polio_cases === -1 ? null : record.polio_cases
    }));

    return processedData;
  } catch (error) {
    console.error('Error in getDiseaseStatsMultipleYears:', error);
    return [];
  }
}

/**
 * Fetch life expectancy data (Male and Female) for multiple years for line chart
 * @param {Array} years - Array of years to fetch data for
 * @param {string} country - The country to fetch data for (optional)
 * @returns {Array} Array of life expectancy data
 */
export async function getLifeExpectancyMultipleYears(years = [2019, 2020, 2021, 2022, 2023, 2024], country = null) {
  try {
    let query = supabase
      .from('who_health_statistics')
      .select(`
        year,
        country_name,
        life_expectancy_male_years,
        life_expectancy_female_years
      `)
      .in('year', years)
      .order('year', { ascending: true });

    if (country) {
      query = query.eq('country_name', country);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching life expectancy data:', error);
      return [];
    }

    // Process data to treat -1 values as null
    const processedData = (data || []).map(record => ({
      ...record,
      life_expectancy_male_years: record.life_expectancy_male_years === -1 ? null : record.life_expectancy_male_years,
      life_expectancy_female_years: record.life_expectancy_female_years === -1 ? null : record.life_expectancy_female_years
    }));

    return processedData;
  } catch (error) {
    console.error('Error in getLifeExpectancyMultipleYears:', error);
    return [];
  }
}
