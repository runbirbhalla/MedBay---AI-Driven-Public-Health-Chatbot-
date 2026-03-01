'use server';

import { supabase } from '@/lib/supabaseClient';

// Fetches all schedules from the database, ordered by their scheduled time
export async function getSchedules() {
    return await supabase.from('schedules').select('*').order('scheduled_at');
}

// Adds a new schedule to the database, including its recurrence rule
export async function addSchedule(formData) {
    const { name, dosage, scheduledAt, phone, recurring } = formData;
    return await supabase.from('schedules').insert({
        medicine_name: name,
        dosage: dosage,
        scheduled_at: scheduledAt,
        user_phone_number: phone,
        recurring_type: recurring, // Add the recurring type to the database
    });
}

// Deletes a schedule from the database by its ID
export async function deleteSchedule(id) {
    return await supabase.from('schedules').delete().eq('id', id);
}
export async function getFilterOptions() {
    // Example: Fetch distinct countries and years for filtering
    const [countryRes, yearRes] = await Promise.all([
        supabase.from('health_data').select('country', { distinct: true }),
        supabase.from('health_data').select('year', { distinct: true }),
    ]);

    if (countryRes.error || yearRes.error) {
        return { options: null, error: countryRes.error || yearRes.error };
    }

    const countries = countryRes.data.map(item => item.country);
    const years = yearRes.data.map(item => item.year);

    return { 
        options: { countries, years }, 
        error: null 
    };
}