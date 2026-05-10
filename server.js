const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Lab State
let securityEnabled = false;

app.get('/api/config', (req, res) => {
    res.json({ securityEnabled });
});

app.post('/api/config/toggle', (req, res) => {
    securityEnabled = !securityEnabled;
    console.log(`Security Shield: ${securityEnabled ? 'ENABLED' : 'DISABLED'}`);
    res.json({ success: true, securityEnabled });
});

/**
 * LOGIN ENDPOINT (Parameterized vs Concentated)
 */
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (securityEnabled) {
        // SECURE VERSION
        const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
        db.get(query, [username, password], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) res.json({ success: true, user: { username: row.username, role: row.role } });
            else res.status(401).json({ success: false });
        });
    } else {
        // VULNERABLE VERSION
        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        db.get(query, (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) res.json({ success: true, user: { username: row.username, role: row.role } });
            else res.status(401).json({ success: false });
        });
    }
});

/**
 * SEARCH ENDPOINT
 */
app.get('/api/search', (req, res) => {
    const searchTerm = req.query.q || '';
    
    if (securityEnabled) {
        const query = `SELECT id, username, role, email FROM users WHERE username LIKE ?`;
        db.all(query, [`%${searchTerm}%`], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ results: rows });
        });
    } else {
        const query = `SELECT id, username, role, email FROM users WHERE username LIKE '%${searchTerm}%'`;
        db.all(query, (err, rows) => {
            if (err) return res.status(500).json({ error: err.message, detail: err.message });
            res.json({ results: rows });
        });
    }
});

/**
 * ADVANCED: BLIND SQL INJECTION (Boolean-based)
 * Does not return any data, only "Found" or "Not Found".
 * Attack: "admin' AND SUBSTR(password, 1, 1) = 'S' --"
 */
app.get('/api/blind-check', (req, res) => {
    const username = req.query.username || '';
    
    // Always vulnerable for demonstration, or gated by securityEnabled
    const query = securityEnabled 
        ? `SELECT 1 FROM users WHERE username = ?` 
        : `SELECT 1 FROM users WHERE username = '${username}'`;
    
    const params = securityEnabled ? [username] : [];

    db.get(query, params, (err, row) => {
        if (err) return res.json({ exists: false, error: true }); // Error often means injection syntax was wrong
        res.json({ exists: !!row });
    });
});

/**
 * ADVANCED: TIME-BASED SQL INJECTION
 * Simulates a delay if the query is true.
 * Attack: "admin' AND (SELECT 1 FROM (SELECT LIKE('ABCDEFG',UPPER(HEX(RANDOMBLOB(100000000)))))) --"
 * In SQLite, we can use heavy computations.
 */
app.get('/api/ping', (req, res) => {
    const id = req.query.id || '';
    
    // A heavy query that takes time in SQLite
    const heavy = `(SELECT count(*) FROM sqlite_master CROSS JOIN sqlite_master CROSS JOIN sqlite_master)`;
    
    const query = securityEnabled
        ? `SELECT username FROM users WHERE id = ?`
        : `SELECT username FROM users WHERE id = '${id}' AND (CASE WHEN (1=1) THEN ${heavy} ELSE 1 END) > 0`;

    const start = Date.now();
    db.get(query, securityEnabled ? [id] : [], (err, row) => {
        const duration = Date.now() - start;
        res.json({ success: true, time: duration });
    });
});

/**
 * UPDATE PROFILE ENDPOINT (Vulnerable to UPDATE SQLi)
 * Attack: DisplayName = "Hacker', role='admin' WHERE username='john_doe' --"
 */
app.post('/api/profile/update', (req, res) => {
    const { username, displayName, email } = req.body;
    
    if (securityEnabled) {
        const query = `UPDATE users SET username = ?, email = ? WHERE username = ?`;
        db.run(query, [displayName, email, username], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, changes: this.changes });
        });
    } else {
        const query = `UPDATE users SET username = '${displayName}', email = '${email}' WHERE username = '${username}'`;
        console.log(`Executing Update Query: ${query}`);
        db.run(query, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    }
});

/**
 * REGISTRATION ENDPOINT (Vulnerable to INSERT SQLi)
 * Attack: Email = "test@test.com', 'admin', 'admin') --"
 */
app.post('/api/register', (req, res) => {
    const { username, password, email } = req.body;
    
    if (securityEnabled) {
        const query = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, 'user')`;
        db.run(query, [username, password, email], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        });
    } else {
        const query = `INSERT INTO users (username, password, email, role) VALUES ('${username}', '${password}', '${email}', 'user')`;
        console.log(`Executing Insert Query: ${query}`);
        db.run(query, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    }
});

app.listen(PORT, () => {
    console.log(`Advanced Lab Server running at http://localhost:${PORT}`);
});
