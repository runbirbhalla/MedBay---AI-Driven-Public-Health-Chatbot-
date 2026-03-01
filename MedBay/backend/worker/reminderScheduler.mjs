// C:\Users\Administrator\Desktop\SIH project 2025\medbayNewest\MedbayTeamSyn3rgy\worker\reminderScheduler.mjs

// ----------------------------------------------------------------------
// 1. IMPORTS & ENVIRONMENT SETUP
// ----------------------------------------------------------------------
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import { createClient } from '@supabase/supabase-js';
import { addDays, addWeeks, addMonths, parseISO, addMinutes } from 'date-fns'; 
import twilio from 'twilio';

// --- Fix for loading .env.worker from the root directory ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env.worker');
dotenv.config({ path: envPath }); 

// --- Load Credentials ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// --- Supabase Client Initialization (Service Role Key Required) ---
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("FATAL ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check your .env.worker file.");
    process.exit(1); 
}
// Using the Service Role Key allows RLS bypass, essential for the worker.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);


// --- Twilio Client Initialization ---
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("TWILIO WARNING: SMS credentials missing. SMS sending will be SIMULATED.");
    // Use a dummy client for simulation if keys are missing
    var twilioClient = { messages: { create: async () => ({ sid: 'SIMULATED' }) } };
} else {
    var twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}


// ----------------------------------------------------
// 2. REAL SMS API INTEGRATION (Using Twilio)
// ----------------------------------------------------
async function sendSms(schedule) {
    const { medicine_name, dosage, user_phone_number, id } = schedule;
    const message = `MedBay Alert: Time for your medication! 💊 ${medicine_name}, Dosage: ${dosage}. Stay healthy!`;
    
    console.log(`[SMS] Attempting to send message to ${user_phone_number} for ${medicine_name}`);

    // If no Twilio keys are configured, skip the API call and return success (simulation)
    if (!TWILIO_ACCOUNT_SID) {
        console.log(`[SMS] Simulated success for schedule ID: ${id}.`);
        return true;
    }

    try {
        const response = await twilioClient.messages.create({
            body: message,
            to: user_phone_number, 
            from: TWILIO_PHONE_NUMBER 
        });

        console.log(`[SMS] SUCCESSFULLY SENT! SID: ${response.sid}`);
        
        // Update status in DB immediately
        await supabase.from('schedules').update({ status: 'sent' }).eq('id', id);

        return true; 
    } catch (error) {
        console.error(`[SMS] FAILED to send reminder for ${id}. Error: ${error.message}`);
        
        // Update status in DB on failure
        await supabase.from('schedules').update({ status: 'error' }).eq('id', id);
        return false;
    }
}


// ----------------------------------------------------
// 3. CORE RECURRENCE LOGIC
// ----------------------------------------------------
async function handleRecurrence(schedule) {
    const { id, scheduled_at, recurring_type } = schedule;

    const lastSentTime = parseISO(scheduled_at); 
    let nextScheduledTime = null;

    switch (recurring_type) {
        case 'once':
            // Delete the one-time record
            console.log(`[Recurrence] Deleting one-time schedule: ${id}`);
            return await supabase
                .from('schedules')
                .delete()
                .eq('id', id);

        case 'daily':
            nextScheduledTime = addDays(lastSentTime, 1);
            break;

        case 'weekly':
            nextScheduledTime = addWeeks(lastSentTime, 1);
            break;

        case 'monthly':
            nextScheduledTime = addMonths(lastSentTime, 1);
            break;

        default:
            console.warn(`[Recurrence] Unknown type: ${recurring_type} for ID: ${id}. Skipping update.`);
            return;
    }

    // Update the 'scheduled_at' to the next cycle time and reset status to 'scheduled'
    if (nextScheduledTime) {
        const nextScheduledISO = nextScheduledTime.toISOString(); 

        const { error } = await supabase
            .from('schedules')
            .update({ 
                scheduled_at: nextScheduledISO,
                status: 'scheduled' // Ready for the next run
            })
            .eq('id', id);

        if (error) {
            console.error(`[Recurrence] Error updating schedule ${id}:`, error);
        } else {
            console.log(`[Recurrence] Schedule ${id} successfully advanced to ${nextScheduledISO}.`);
        }
    }
}


// ----------------------------------------------------
// 4. MAIN WORKER EXECUTION LOOP
// ----------------------------------------------------
async function runReminderScheduler() {
    const runTime = new Date();
    console.log(`[Worker] Starting check for due reminders at ${runTime.toISOString()}`);

    // --- EXPANDED SEARCH WINDOW FIX ---
    // Look back 24 hours to catch any missed or past-due reminders for easier testing
    const oneDayAgo = addDays(runTime, -1).toISOString(); 
    const nowISO = runTime.toISOString();

    // Fetch schedules that are DUE and not yet 'sent' in this window
    const { data: dueSchedules, error } = await supabase
        .from('schedules')
        .select('*')
        .lte('scheduled_at', nowISO) 
        .gte('scheduled_at', oneDayAgo) 
        .neq('status', 'sent'); 

    if (error) {
        console.error("[Worker] Error fetching due schedules:", error);
        return;
    }

    if (dueSchedules.length === 0) {
        console.log("[Worker] No reminders are currently due.");
        return;
    }

    console.log(`[Worker] Found ${dueSchedules.length} schedules to process.`);

    // Process each due schedule
    for (const schedule of dueSchedules) {
        
        // 1. Attempt to send SMS
        const smsSuccess = await sendSms(schedule);

        if (smsSuccess) {
            // 2. Handle Recurrence (Update the time/delete the record)
            await handleRecurrence(schedule);
        }
    }
    console.log("[Worker] Reminder check complete.");
}

// Execute the worker
runReminderScheduler();