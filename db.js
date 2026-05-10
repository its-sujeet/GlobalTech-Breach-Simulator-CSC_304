const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Use in-memory for the lab, or 'lab.db' for persistence

db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        email TEXT
    )`);

    // Create a table with sensitive data to extract later
    db.run(`CREATE TABLE secret_vault (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        secret_data TEXT
    )`);

    // Seed users
    const users = [
        ['admin', 'SuperSecurePass123!', 'admin', 'admin@secucorp.com'],
        ['john_doe', 'password123', 'Engineering', 'john.d@secucorp.com'],
        ['jane_smith', 'jane@2024', 'Marketing', 'jane.s@secucorp.com'],
        ['robert_brown', 'rbrown!99', 'Engineering', 'robert.b@secucorp.com'],
        ['emily_white', 'emily_rules', 'HR', 'emily.w@secucorp.com'],
        ['michael_scott', 'dundermifflin', 'Management', 'm.scott@secucorp.com'],
        ['sarah_connor', 'skynet123', 'Security', 's.connor@secucorp.com'],
        ['bruce_wayne', 'i_am_batman', 'CEO', 'b.wayne@secucorp.com'],
        ['clark_kent', 'superman88', 'Communications', 'c.kent@secucorp.com'],
        ['peter_parker', 'spidey_sense', 'Photography', 'p.parker@secucorp.com']
    ];

    const userStmt = db.prepare("INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)");
    users.forEach(user => userStmt.run(user));
    userStmt.finalize();

    // Seed secret vault
    const secrets = [
        [1, 'Corporate Strategy 2026: Expansion into Moon'],
        [1, 'Admin Bank Token: 9988-7766-5544-3322'],
        [8, 'Batmobile Bluetooth PIN: 0000'],
        [8, 'Waynetech Prototype Key: WY-882-X9'],
        [7, 'Mainframe Backdoor Pass: hacktheplanet'],
        [5, 'Employee Disciplinary Record: Michael Scott (Inappropriate behavior)'],
        [2, 'Internal API Key: sk_live_51M3f...2z8'],
        [4, 'Personal PIN: 4321']
    ];

    const secretStmt = db.prepare("INSERT INTO secret_vault (user_id, secret_data) VALUES (?, ?)");
    secrets.forEach(secret => secretStmt.run(secret));
    secretStmt.finalize();

    console.log("Database initialized and seeded.");
});

module.exports = db;
