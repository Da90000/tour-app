// routes/groups.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../db');
const router = express.Router();

router.get('/', protect, async (req, res) => { try { const rows = await db.allAsync(`SELECT g.group_id, g.group_name, g.description, ug.role FROM groups g JOIN users_groups ug ON g.group_id = ug.group_id WHERE ug.user_id = ?`, [req.user.userId]); res.status(200).json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch groups.' }); } });
router.post('/', protect, async (req, res) => { const { group_name, description } = req.body; const creatorId = req.user.userId; try { await db.runAsync('BEGIN TRANSACTION'); const groupResult = await db.runAsync(`INSERT INTO groups (group_name, description) VALUES (?, ?)`, [group_name, description]); const newGroupId = groupResult.lastID; await db.runAsync(`INSERT INTO users_groups (user_id, group_id, role) VALUES (?, ?, 'admin')`, [creatorId, newGroupId]); await db.runAsync('COMMIT'); res.status(201).json({ message: 'Group created.', group: { groupId: newGroupId, group_name, description } }); } catch (error) { await db.runAsync('ROLLBACK'); res.status(500).json({ message: 'Failed to create group.' }); } });
router.put('/:groupId', protect, async (req, res) => { try { const { group_name, description } = req.body; const { groupId } = req.params; const result = await db.runAsync(`UPDATE groups SET group_name = ?, description = ? WHERE group_id = ?`, [group_name, description, groupId]); if (result.changes === 0) return res.status(404).json({ message: 'Group not found.' }); res.status(200).json({ message: 'Group updated successfully.' }); } catch (error) { res.status(500).json({ message: 'Failed to update group.' }); } });
router.delete('/:groupId', protect, async (req, res) => { try { const { groupId } = req.params; const result = await db.runAsync(`DELETE FROM groups WHERE group_id = ?`, [groupId]); if (result.changes === 0) return res.status(404).json({ message: 'Group not found.' }); res.status(200).json({ message: 'Group deleted successfully.' }); } catch (error) { res.status(500).json({ message: 'Failed to delete group.' }); } });
router.get('/:groupId/users', protect, async (req, res) => { try { const adminId = req.user.userId; const { groupId } = req.params; const row = await db.getAsync(`SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?`, [adminId, groupId]); if (!row || row.role !== 'admin') return res.status(403).json({ message: 'Forbidden.' }); const users = await db.allAsync(`SELECT u.user_id, u.username, u.email, ug.role FROM users u JOIN users_groups ug ON u.user_id = ug.user_id WHERE ug.group_id = ?`, [groupId]); res.status(200).json(users); } catch (error) { res.status(500).json({ message: 'Failed to fetch users for the group.' }); } });
router.post('/:groupId/users', protect, async (req, res) => { try { const adminId = req.user.userId; const { groupId } = req.params; const { email } = req.body; const adminRow = await db.getAsync(`SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?`, [adminId, groupId]); if (!adminRow || adminRow.role !== 'admin') return res.status(403).json({ message: 'Forbidden.' }); const user = await db.getAsync(`SELECT user_id FROM users WHERE email = ?`, [email]); if (!user) return res.status(404).json({ message: 'User not found.' }); const existing = await db.getAsync(`SELECT * FROM users_groups WHERE user_id = ? AND group_id = ?`, [user.user_id, groupId]); if (existing) return res.status(409).json({ message: 'User is already in this group.' }); await db.runAsync(`INSERT INTO users_groups (user_id, group_id, role) VALUES (?, ?, 'member')`, [user.user_id, groupId]); res.status(201).json({ message: 'User added.' }); } catch (error) { res.status(500).json({ message: 'Failed to add user.' }); } });
router.delete('/:groupId/users/:userId', protect, async (req, res) => { try { const adminId = req.user.userId; const { groupId, userId } = req.params; const adminRow = await db.getAsync(`SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?`, [adminId, groupId]); if (!adminRow || adminRow.role !== 'admin') return res.status(403).json({ message: 'Forbidden.' }); if (adminId.toString() === userId) return res.status(400).json({ message: 'Admin cannot remove themselves.' }); const result = await db.runAsync(`DELETE FROM users_groups WHERE user_id = ? AND group_id = ?`, [userId, groupId]); if (result.changes === 0) return res.status(404).json({ message: 'User not found in group.' }); res.status(200).json({ message: 'User removed.' }); } catch (error) { res.status(500).json({ message: 'Failed to remove user.' }); } });

// Get all map-pinnable locations for a group
router.get('/:groupId/map-pins', protect, async (req, res) => {
    const { groupId } = req.params;

    try {
        const pins = await db.allAsync(`
            SELECT
                e.event_id as id,
                e.event_name as name,
                l.latitude,
                l.longitude,
                l.order_in_day,
                l.location_name,
                d.day_id
            FROM events e
            JOIN locations l ON e.location_id = l.location_id
            JOIN tour_days d ON l.day_id = d.day_id
            WHERE d.group_id = ?
              AND l.latitude IS NOT NULL
              AND l.longitude IS NOT NULL
              AND d.status IN ('Upcoming', 'Ongoing', 'Ended')
        `, [groupId]);

        res.status(200).json(pins);

    } catch (error) {
        console.error("Error fetching map pins for group:", error);
        res.status(500).json({ message: 'Failed to fetch map pins.' });
    }
});

module.exports = router;