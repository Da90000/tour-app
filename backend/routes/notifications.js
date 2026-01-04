// routes/notifications.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const db = require('../db');

router.post('/save-token', protect, async (req, res) => {
    console.log("[Backend] Received request to /api/notifications/save-token"); // <-- ADDED LOG
    const { token } = req.body;
    const userId = req.user.userId;

    if (!token) {
        console.error("[Backend] Save token failed: No token provided in request body.");
        return res.status(400).json({ message: 'Token (subscription object) is required.' });
    }

    try {
        const subscription = JSON.parse(token);
        const endpoint = subscription.endpoint;

        if (!endpoint) {
            console.error("[Backend] Save token failed: Parsed token has no endpoint.");
            return res.status(400).json({ message: 'Subscription object must have an endpoint.' });
        }

        console.log(`[Backend] Attempting to save token for user ${userId} with endpoint ${endpoint.slice(0, 50)}...`);

        // Use INSERT OR IGNORE to prevent duplicates for the same endpoint
        await db.runAsync(
            `INSERT OR IGNORE INTO push_tokens (user_id, token, endpoint) VALUES (?, ?, ?)`, 
            [userId, token, endpoint]
        );
        
        // Ensure the user_id is up-to-date for this endpoint, in case another user on the same device logged in
        await db.runAsync(
            'UPDATE push_tokens SET user_id = ? WHERE endpoint = ?',
            [userId, endpoint]
        );

        console.log(`[Backend] Successfully saved token for user ${userId}.`);
        res.status(200).json({ message: 'Push token saved successfully.' });
    } catch (error) {
        // --- ADDED DETAILED ERROR LOGGING ---
        console.error("=========================================");
        console.error("!!! BACKEND ERROR SAVING PUSH TOKEN !!!");
        console.error("Request Body:", req.body);
        console.error("Error Object:", error);
        console.error("=========================================");
        res.status(500).json({ message: 'Failed to save push token on the server.' });
    }
});

module.exports = router;
