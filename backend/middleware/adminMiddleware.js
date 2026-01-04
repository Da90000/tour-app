// middleware/adminMiddleware.js
const db = require('../db');
const isAdmin = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.userId;
        if (!groupId) return res.status(400).json({ message: 'Group ID is required for this action.' });
        const user = await db.getAsync(`SELECT role FROM users WHERE user_id = ?`, [userId]);
        if (user && user.role === 'admin') {
            return next();
        }
        res.status(403).json({ message: 'Forbidden. Admin access required.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying admin privileges.' });
    }
};
module.exports = { isAdmin };