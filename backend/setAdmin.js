// setAdmin.js
const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('./tour_manager.db', (err) => {
    if (err) {
        return console.error('Error connecting to database:', err.message);
    }
    console.log('Connected to the SQLite database to set admin role.');
});

// --- IMPORTANT: CHANGE THIS TO YOUR NEWLY REGISTERED ADMIN EMAIL ---
const adminEmail = 'admin@email.com'; 
// -----------------------------------------------------------------

const newUsername = 'Admin'; // You can also enforce the username here

const sql = `UPDATE users SET role = 'admin', username = ? WHERE email = ?`;

db.run(sql, [newUsername, adminEmail], function(err) {
    if (err) {
        return console.error('Error updating user role:', err.message);
    }
    if (this.changes > 0) {
        console.log(`Success! User '${adminEmail}' has been set to role 'admin' with username '${newUsername}'.`);
    } else {
        console.log(`No user found with the email '${adminEmail}'. Please check the email address in the script and make sure you have registered first.`);
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        return console.error('Error closing database:', err.message);
    }
    console.log('Database connection closed.');
});