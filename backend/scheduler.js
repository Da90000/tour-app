// scheduler.js
const cron = require('node-cron');
const db = require('./db');
const { sendPushNotification } = require('./firebase');
const { getIo } = require('./socket');

const startScheduler = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    console.log(`[${now.toLocaleString()}] Scheduler running...`);
    const io = getIo();

    const checkTimeLower = new Date(now.getTime() - 30 * 1000);
    const checkTimeUpper = new Date(now.getTime() + 30 * 1000);
    const todayString = now.toISOString().split('T')[0];

    // Task 1: Event Reminders
    try {
      const events = await db.allAsync(`
        SELECT e.*, d.group_id FROM events e 
        JOIN locations l ON e.location_id = l.location_id 
        JOIN tour_days d ON l.day_id = d.day_id 
        WHERE d.day_date = ? AND e.reminder_minutes > 0 AND e.event_time IS NOT NULL AND e.event_time != ''
      `, [todayString]);

      for (const event of events) {
        const [hour, minute] = event.event_time.split(':');
        const eventDate = new Date();
        eventDate.setHours(hour, minute, 0, 0);
        const reminderTime = new Date(eventDate.getTime() - event.reminder_minutes * 60000);

        if (reminderTime >= checkTimeLower && reminderTime < checkTimeUpper) {
          const title = "Upcoming Event";
          const message = `Reminder: "${event.event_name}" is in ${event.reminder_minutes} minutes!`;
          io.to(`group-${event.group_id}`).emit('notification', { title, message });
          const userTokens = await db.allAsync(`SELECT token FROM push_tokens WHERE user_id IN (SELECT user_id FROM users_groups WHERE group_id = ?)`, [event.group_id]);
          const tokens = userTokens.map(t => t.token);
          if (tokens.length > 0) await sendPushNotification(tokens, title, message);
          console.log(`Sent reminder for event "${event.event_name}" to group ${event.group_id}`);
        }
      }
    } catch (error) { console.error("Scheduler Error (Event Reminders):", error); }

    // Task 2: Location Reminders (NEW)
    try {
      const locations = await db.allAsync(`
        SELECT l.*, d.group_id FROM locations l
        JOIN tour_days d ON l.day_id = d.day_id
        WHERE d.day_date = ? AND l.reminder_minutes > 0 AND l.start_time IS NOT NULL AND l.start_time != ''
      `, [todayString]);

      for (const location of locations) {
        const [hour, minute] = location.start_time.split(':');
        const locationDate = new Date();
        locationDate.setHours(hour, minute, 0, 0);
        const reminderTime = new Date(locationDate.getTime() - location.reminder_minutes * 60000);

        if (reminderTime >= checkTimeLower && reminderTime < checkTimeUpper) {
          const title = "Upcoming Location";
          const message = `Reminder: You need to be at "${location.location_name}" in ${location.reminder_minutes} minutes!`;
          io.to(`group-${location.group_id}`).emit('notification', { title, message });
          const userTokens = await db.allAsync(`SELECT token FROM push_tokens WHERE user_id IN (SELECT user_id FROM users_groups WHERE group_id = ?)`, [location.group_id]);
          const tokens = userTokens.map(t => t.token);
          if (tokens.length > 0) await sendPushNotification(tokens, title, message);
          console.log(`Sent reminder for location "${location.location_name}" to group ${location.group_id}`);
        }
      }
    } catch (error) { console.error("Scheduler Error (Location Reminders):", error); }

    // Task 3: Scheduled Announcements
    try {
        const scheduledAnnouncements = await db.allAsync(`SELECT * FROM announcements WHERE scheduled_for IS NOT NULL AND scheduled_for <= ?`, [now.toISOString()]);
        if (scheduledAnnouncements.length > 0) {
            for (const announcement of scheduledAnnouncements) {
                const title = "Scheduled Announcement";
                const { message, group_id } = announcement;
                io.to(`group-${group_id}`).emit('notification', { title, message });
                const userTokens = await db.allAsync(`SELECT token FROM push_tokens WHERE user_id IN (SELECT user_id FROM users_groups WHERE group_id = ?)`, [group_id]);
                const tokens = userTokens.map(t => t.token);
                if (tokens.length > 0) await sendPushNotification(tokens, title, message);
                await db.runAsync(`UPDATE announcements SET scheduled_for = NULL WHERE announcement_id = ?`, [announcement.announcement_id]);
                console.log(`Sent scheduled announcement ID ${announcement.announcement_id} to group ${group_id}`);
            }
        }
    } catch (error) { console.error("Scheduler Error (Announcements):", error); }
  });
};

module.exports = { startScheduler };