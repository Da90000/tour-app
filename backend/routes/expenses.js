// routes/expenses.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const db = require('../db');
const router = express.Router();

// --- USER-FACING ROUTES ---

router.post('/', protect, async (req, res) => {
    const { event_id, quantity = 1 } = req.body;
    const userId = req.user.userId;
    if (!event_id) return res.status(400).json({ message: 'Event ID is required.' });

    try {
        const result = await db.getAsync(`
            SELECT td.status, ev.estimated_cost_per_unit FROM tour_days td
            JOIN locations l ON td.day_id = l.day_id
            JOIN events ev ON l.location_id = ev.location_id
            WHERE ev.event_id = ?
        `, [event_id]);

        if (!result || result.status !== 'Ongoing') {
            return res.status(403).json({ message: 'Expenses can only be added for events on an "Ongoing" day.' });
        }

        const { estimated_cost_per_unit } = result;
        const existingExpense = await db.getAsync(`SELECT * FROM expenses WHERE user_id = ? AND event_id = ?`, [userId, event_id]);
        if (existingExpense) {
            const newQuantity = existingExpense.quantity + quantity;
            const newTotalCost = estimated_cost_per_unit * newQuantity;
            await db.runAsync(`UPDATE expenses SET quantity = ?, total_cost = ?, updated_at = CURRENT_TIMESTAMP WHERE expense_id = ?`, [newQuantity, newTotalCost, existingExpense.expense_id]);
            res.status(200).json({ message: 'Expense quantity updated.' });
        } else {
            const totalCost = estimated_cost_per_unit * quantity;
            await db.runAsync(`INSERT INTO expenses (user_id, event_id, quantity, total_cost) VALUES (?, ?, ?, ?)`, [userId, event_id, quantity, totalCost]);
            res.status(201).json({ message: 'Expense recorded.' });
        }
    } catch (error) { console.log(error); res.status(500).json({ message: 'Server error processing expense.' }); }
});

router.get('/my-expenses', protect, async (req, res) => {
    const userId = req.user.userId;
    const sql = `
        SELECT ex.*, ev.event_name, ev.estimated_cost_per_unit, loc.location_name, td.title as day_title, td.day_number, td.status as day_status
        FROM expenses ex
        JOIN events ev ON ex.event_id = ev.event_id
        JOIN locations loc ON ev.location_id = loc.location_id
        JOIN tour_days td ON loc.day_id = td.day_id
        WHERE ex.user_id = ? ORDER BY ex.expense_timestamp DESC
    `;
    try {
        const rows = await db.allAsync(sql, [userId]);
        res.status(200).json(rows);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch expenses.' }); }
});

router.put('/:expenseId', protect, async (req, res) => {
    const { expenseId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;
    if (!quantity || quantity < 1) return res.status(400).json({ message: 'A valid quantity is required.' });

    try {
        const result = await db.getAsync(`
            SELECT ev.estimated_cost_per_unit, td.status FROM expenses ex
            JOIN events ev ON ex.event_id = ev.event_id JOIN locations l ON ev.location_id = l.location_id JOIN tour_days td ON l.day_id = td.day_id
            WHERE ex.expense_id = ? AND ex.user_id = ?
        `, [expenseId, userId]);

        if (!result) return res.status(404).json({ message: 'Expense not found or you do not have permission.' });
        if (result.status !== 'Ongoing') return res.status(403).json({ message: 'Expenses can only be edited during an "Ongoing" day.' });

        const newTotalCost = result.estimated_cost_per_unit * quantity;
        await db.runAsync(`UPDATE expenses SET quantity = ?, total_cost = ? WHERE expense_id = ?`, [quantity, newTotalCost, expenseId]);
        res.status(200).json({ message: 'Expense updated.' });
    } catch (error) { res.status(500).json({ message: 'Failed to update expense.' }); }
});

router.delete('/:expenseId', protect, async (req, res) => {
    const { expenseId } = req.params;
    const userId = req.user.userId;
    try {
        const result = await db.getAsync(`
            SELECT td.status FROM expenses ex
            JOIN events ev ON ex.event_id = ev.event_id JOIN locations l ON ev.location_id = l.location_id JOIN tour_days td ON l.day_id = td.day_id
            WHERE ex.expense_id = ? AND ex.user_id = ?
        `, [expenseId, userId]);

        if (!result) return res.status(404).json({ message: 'Expense not found or you do not have permission.' });
        if (result.status !== 'Ongoing') return res.status(403).json({ message: 'Expenses can only be deleted during an "Ongoing" day.' });

        await db.runAsync(`DELETE FROM expenses WHERE expense_id = ?`, [expenseId]);
        res.status(200).json({ message: 'Expense deleted.' });
    } catch (error) { res.status(500).json({ message: 'Failed to delete expense.' }); }
});


// --- ADMIN-ONLY ROUTES ---

router.post('/admin', protect, async (req, res) => {
    const { event_id, user_ids, quantity, actual_cost_per_unit } = req.body;
    const adminId = req.user.userId;

    if (!event_id || !user_ids || !user_ids.length || !quantity || actual_cost_per_unit == null) {
        return res.status(400).json({ message: "Event, user(s), quantity, and cost are required." });
    }

    try {
        // Authorization check
        const groupInfo = await db.getAsync(`SELECT d.group_id FROM events e JOIN locations l ON e.location_id = l.location_id JOIN tour_days d ON l.day_id = d.day_id WHERE e.event_id = ?`, [event_id]);
        if (!groupInfo) return res.status(404).json({ message: "Event not found." });
        const adminRole = await db.getAsync(`SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?`, [adminId, groupInfo.group_id]);
        if (!adminRole || adminRole.role !== 'admin') return res.status(403).json({ message: "Forbidden." });

        await db.runAsync('BEGIN TRANSACTION');
        const total_cost = quantity * actual_cost_per_unit;
        for (const user_id of user_ids) {
            await db.runAsync(`INSERT INTO expenses (user_id, event_id, quantity, total_cost) VALUES (?, ?, ?, ?)`, [user_id, event_id, quantity, total_cost]);
        }
        await db.runAsync('COMMIT');
        res.status(201).json({ message: `Expense added for ${user_ids.length} user(s).` });
    } catch (error) {
        await db.runAsync('ROLLBACK');
        console.error("Admin add expense error:", error);
        res.status(500).json({ message: 'Server error while adding expense.' });
    }
});

router.put('/admin/:expenseId', protect, async (req, res) => {
    const { expenseId } = req.params;
    const { quantity, total_cost } = req.body;
    const adminId = req.user.userId;

    try {
        const expense = await db.getAsync(`SELECT ex.*, td.group_id FROM expenses ex JOIN events e ON ex.event_id = e.event_id JOIN locations l ON e.location_id = l.location_id JOIN tour_days td ON l.day_id = td.day_id WHERE ex.expense_id = ?`, [expenseId]);
        if (!expense) return res.status(404).json({ message: "Expense not found." });

        const adminRole = await db.getAsync(`SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?`, [adminId, expense.group_id]);
        if (!adminRole || adminRole.role !== 'admin') return res.status(403).json({ message: "Forbidden." });

        await db.runAsync(`UPDATE expenses SET quantity = ?, total_cost = ? WHERE expense_id = ?`, [quantity, total_cost, expenseId]);
        res.status(200).json({ message: "Expense updated by admin." });
    } catch (error) {
        console.error("Admin update expense error:", error);
        res.status(500).json({ message: 'Server error while updating expense.' });
    }
});

router.delete('/admin/:expenseId', protect, async (req, res) => {
    const { expenseId } = req.params;
    const adminId = req.user.userId;
    try {
        const expense = await db.getAsync(`SELECT ex.*, td.group_id FROM expenses ex JOIN events e ON ex.event_id = e.event_id JOIN locations l ON e.location_id = l.location_id JOIN tour_days td ON l.day_id = td.day_id WHERE ex.expense_id = ?`, [expenseId]);
        if (!expense) return res.status(404).json({ message: "Expense not found." });

        const adminRole = await db.getAsync(`SELECT role FROM users_groups WHERE user_id = ? AND group_id = ?`, [adminId, expense.group_id]);
        if (!adminRole || adminRole.role !== 'admin') return res.status(403).json({ message: "Forbidden." });

        await db.runAsync(`DELETE FROM expenses WHERE expense_id = ?`, [expenseId]);
        res.status(200).json({ message: "Expense deleted by admin." });
    } catch (error) {
        console.error("Admin delete expense error:", error);
        res.status(500).json({ message: 'Server error while deleting expense.' });
    }
});

module.exports = router;