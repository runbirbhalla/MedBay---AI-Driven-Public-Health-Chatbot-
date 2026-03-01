import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Use the Service Role Key for admin-level access
    )

    // 1. Find all schedules that are due now.
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .lte('scheduled_at', new Date().toISOString())
      .eq('status', 'scheduled')

    if (error) throw error

    if (schedules.length === 0) {
      return new Response(JSON.stringify({ message: 'No reminders to send.' }), {
        headers: { 'Content-Type': 'application/json' }, status: 200,
      })
    }

    // 2. Process each reminder
    const processingPromises = schedules.map(async (schedule) => {
      // Send the SMS via Twilio
      const messageBody = `MedBay Reminder: Time for your ${schedule.medicine_name} (${schedule.dosage}).`
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: schedule.user_phone_number, From: TWILIO_PHONE_NUMBER, Body: messageBody }),
      })

      // 3. Reschedule or complete the reminder
      let nextOccurrence = new Date(schedule.scheduled_at)
      let newStatus = 'scheduled'

      switch (schedule.recurring_type) {
        case 'daily':
          nextOccurrence.setDate(nextOccurrence.getDate() + 1)
          break;
        case 'weekly':
          nextOccurrence.setDate(nextOccurrence.getDate() + 7)
          break;
        case 'monthly':
          nextOccurrence.setMonth(nextOccurrence.getMonth() + 1)
          break;
        default: // 'once'
          newStatus = 'sent' // Mark as sent and don't reschedule
          break;
      }
      
      const updatePayload = {
          status: newStatus,
          scheduled_at: schedule.recurring_type !== 'once' ? nextOccurrence.toISOString() : schedule.scheduled_at,
      };

      return supabase.from('schedules').update(updatePayload).eq('id', schedule.id)
    })

    await Promise.all(processingPromises)

    return new Response(JSON.stringify({ message: `Successfully processed ${schedules.length} reminders.` }), {
      headers: { 'Content-Type': 'application/json' }, status: 200,
    })
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})