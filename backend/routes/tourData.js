// routes/tourData.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const db = require('../db');
const router = express.Router();

// --- Day Routes ---
router.post('/:groupId/days', protect, isAdmin, async (req, res) => { try { const { day_number, title, day_date, description } = req.body; const result = await db.runAsync(`INSERT INTO tour_days (group_id, day_number, title, day_date, description, status) VALUES (?, ?, ?, ?, ?, 'Upcoming')`, [req.params.groupId, day_number, title, day_date, description]); res.status(201).json({ dayId: result.lastID }); } catch (error) { console.error("Error creating tour day:", error); res.status(500).json({ message: 'Failed to create tour day.' }); } });
router.put('/days/:dayId', protect, async (req, res) => { try { const { day_number, title, day_date, description } = req.body; await db.runAsync(`UPDATE tour_days SET day_number = ?, title = ?, day_date = ?, description = ? WHERE day_id = ?`, [day_number, title, day_date, description, req.params.dayId]); res.status(200).json({ message: 'Day updated.' }); } catch (error) { console.error("Error updating day:", error); res.status(500).json({ message: 'Failed to update day.' }); } });
router.put('/days/:dayId/status', protect, async (req, res) => { try { const { status } = req.body; const validStatuses = ['Upcoming', 'Ongoing', 'Ended']; if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status.' }); const result = await db.runAsync(`UPDATE tour_days SET status = ? WHERE day_id = ?`, [status, req.params.dayId]); if (result.changes === 0) return res.status(404).json({ message: 'Day not found.' }); res.status(200).json({ message: 'Status updated.' }); } catch (error) { console.error("Error updating day status:", error); res.status(500).json({ message: 'Failed to update status.' }); } });
router.delete('/days/:dayId', protect, async (req, res) => { try { await db.runAsync(`DELETE FROM tour_days WHERE day_id = ?`, [req.params.dayId]); res.status(200).json({ message: 'Day deleted.' }); } catch (error) { console.error("Error deleting day:", error); res.status(500).json({ message: 'Failed to delete day.' }); } });

// --- Location Routes ---
router.post('/days/:dayId/locations', protect, async (req, res) => {
    try {
        const { location_name, order_in_day, latitude, longitude, start_time, end_time, reminder_minutes, description } = req.body;
        const result = await db.runAsync(
            `INSERT INTO locations (day_id, location_name, order_in_day, latitude, longitude, start_time, end_time, reminder_minutes, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.dayId, location_name, order_in_day, latitude, longitude, start_time || null, end_time || null, reminder_minutes || 0, description || null]
        );
        res.status(201).json({ locationId: result.lastID });
    } catch (error) {
        console.error("Error adding location:", error);
        res.status(500).json({ message: 'Failed to add location.' });
    }
});

router.put('/locations/:locationId', protect, async (req, res) => {
    try {
        const { location_name, order_in_day, latitude, longitude, start_time, end_time, reminder_minutes, description } = req.body;
        await db.runAsync(
            `UPDATE locations SET location_name = ?, order_in_day = ?, latitude = ?, longitude = ?, start_time = ?, end_time = ?, reminder_minutes = ?, description = ? WHERE location_id = ?`,
            [location_name, order_in_day, latitude, longitude, start_time || null, end_time || null, reminder_minutes || 0, description || null, req.params.locationId]
        );
        res.status(200).json({ message: 'Location updated.' });
    } catch (error) {
        console.error("ERROR UPDATING LOCATION:", error); 
        res.status(500).json({ message: 'Failed to update location.' });
    }
});

router.delete('/locations/:locationId', protect, async (req, res) => { try { await db.runAsync(`DELETE FROM locations WHERE location_id = ?`, [req.params.locationId]); res.status(200).json({ message: 'Location deleted.' }); } catch (error) { console.error("Error deleting location:", error); res.status(500).json({ message: 'Failed to delete location.' }); } });

// --- Event Routes ---
router.post('/locations/:locationId/events', protect, async (req, res) => { try { const { event_name, description, estimated_cost_per_unit, event_time, reminder_minutes } = req.body; const result = await db.runAsync(`INSERT INTO events (location_id, event_name, description, estimated_cost_per_unit, event_time, reminder_minutes) VALUES (?, ?, ?, ?, ?, ?)`, [req.params.locationId, event_name, description, estimated_cost_per_unit, event_time, reminder_minutes]); res.status(201).json({ eventId: result.lastID }); } catch (error) { console.error("Error adding event:", error); res.status(500).json({ message: 'Failed to add event.' }); } });
router.put('/events/:eventId', protect, async (req, res) => { try { const { event_name, description, estimated_cost_per_unit, event_time, reminder_minutes } = req.body; await db.runAsync(`UPDATE events SET event_name = ?, description = ?, estimated_cost_per_unit = ?, event_time = ?, reminder_minutes = ? WHERE event_id = ?`, [event_name, description, parseFloat(estimated_cost_per_unit), event_time, reminder_minutes, req.params.eventId]); res.status(200).json({ message: 'Event updated.' }); } catch (error) { console.error("Error updating event:", error); res.status(500).json({ message: 'Failed to update event.' }); } });
router.delete('/events/:eventId', protect, async (req, res) => { try { await db.runAsync(`DELETE FROM events WHERE event_id = ?`, [req.params.eventId]); res.status(200).json({ message: 'Event deleted.' }); } catch (error) { console.error("Error deleting event:", error); res.status(500).json({ message: 'Failed to delete event.' }); } });

// --- Get Full Itinerary Route ---
router.get('/:groupId', protect, async (req, res) => { try { const days = await db.allAsync(`SELECT * FROM tour_days WHERE group_id = ? ORDER BY day_number`, [req.params.groupId]); const daysWithData = []; for (const day of days) { const locations = await db.allAsync(`SELECT * FROM locations WHERE day_id = ? ORDER BY order_in_day`, [day.day_id]); const locationsWithData = []; for (const location of locations) { const events = await db.allAsync(`SELECT * FROM events WHERE location_id = ? ORDER BY event_time, event_name`, [location.location_id]); locationsWithData.push({ ...location, events }); } daysWithData.push({ ...day, locations: locationsWithData }); } res.status(200).json({ group_id: req.params.groupId, days: daysWithData }); } catch (error) { console.error("Error fetching itinerary:", error); res.status(500).json({ message: "Failed to fetch itinerary." }); } });

module.exports = router;
