// routes/announcements.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const db = require('../db');
const { getIo } = require('../socket');
const { sendPushNotification } = require('../firebase'); // Import push function

router.post('/', protect, async (req, res) => {
    const { groupId, message } = req.body;
    if (!groupId || !message || !message.trim()) {
        return res.status(400).json({ message: 'Group ID and a non-empty message are required.' });
    }

    try {
        // 1. Send real-time in-app notification via Socket.IO
        const io = getIo();
        const title = "Admin Announcement";
        io.to(`group-${groupId}`).emit('notification', { title, message });
        
        // 2. Send Web Push Notification via Firebase
        const userTokens = await db.allAsync(
            `SELECT token FROM push_tokens WHERE user_id IN (SELECT user_id FROM users_groups WHERE group_id = ?)`,
            [groupId]
        );
        if (userTokens.length > 0) {
            await sendPushNotification(userTokens, title, message);
        }
        
        await db.runAsync(
            `INSERT INTO announcements (group_id, message) VALUES (?, ?)`,
            [groupId, message]
        );
        res.status(200).json({ message: 'Announcement sent and saved.' });
    } catch (error) {
        console.error("Error sending instant announcement:", error);
        res.status(500).json({ message: 'Server error sending announcement.' });
    }
});

// Scheduled announcements already work with the updated scheduler, no change needed here
router.post('/scheduled', protect, async (req, res) => {
  //... this route remains unchanged
});

module.exports = router;
