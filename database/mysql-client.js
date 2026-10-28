/**
 * =========================================================================
 * ALL INDIA COUNCIL FOR TECHNICAL EDUCATION (AICTE)
 * MySQL Database Integration Client & ORM Bridge (SIH 2026)
 * Connects directly to MySQL database 'storage' with Bcrypt Security & Graceful Fallback
 * =========================================================================
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('../config/env');

const dbConfig = {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    waitForConnections: true,
    connectionLimit: config.database.connectionLimit,
    queueLimit: config.database.queueLimit
};

class MySqlClient {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.init();
    }

    async init() {
        try {
            this.pool = mysql.createPool(dbConfig);
            const [rows] = await this.pool.query('SELECT 1 as health');
            this.isConnected = true;
            console.log('[MySQL] Connected successfully to database: storage');
            await this.ensureTables();
        } catch (err) {
            this.isConnected = false;
            console.warn('[MySQL] Warning: MySQL connection not active. Operating in resilient JSON/Memory mode.', err.message);
        }
    }

    async ensureTables() {
        if (!this.isConnected || !this.pool) return;
        try {
            // Ensure users table exists with all required fields
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    email VARCHAR(150) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    phone VARCHAR(50) DEFAULT '+91 99999 00000',
                    user_type VARCHAR(50) DEFAULT 'STUDENT',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB;
            `);

            // Ensure complaints table exists in MySQL as well
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS complaints (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    complaint_id VARCHAR(50) NOT NULL UNIQUE,
                    permanent_id VARCHAR(50) NOT NULL,
                    institution_name VARCHAR(255) NOT NULL,
                    category VARCHAR(150) NOT NULL,
                    subject VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    status VARCHAR(50) DEFAULT 'PENDING',
                    priority VARCHAR(50) DEFAULT 'HIGH',
                    assigned_bureau VARCHAR(150) NOT NULL,
                    assigned_officer VARCHAR(150) DEFAULT 'Pending Allocation',
                    last_action TEXT,
                    next_action TEXT,
                    sla_deadline DATE,
                    days_remaining INT DEFAULT 30,
                    is_sla_breached BOOLEAN DEFAULT FALSE,
                    complainant_email VARCHAR(150),
                    complainant_name VARCHAR(150),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_comp_pid (permanent_id),
                    INDEX idx_comp_status (status)
                ) ENGINE=InnoDB;
            `);
            console.log('[MySQL] Schema verification complete: users and complaints tables ready.');
        } catch (e) {
            console.error('[MySQL] Schema initialization error:', e.message);
        }
    }

    async findUserByIdentifier(identifier) {
        if (!this.isConnected || !this.pool) return null;
        try {
            const clean = String(identifier).trim().toLowerCase();
            const [rows] = await this.pool.query(
                'SELECT id, name, username, email, password, phone, user_type, created_at FROM users WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1',
                [clean, clean]
            );
            return rows[0] || null;
        } catch (err) {
            console.error('[MySQL] findUser error:', err.message);
            return null;
        }
    }

    async registerUser({ name, username, email, password, phone, userType }) {
        if (!this.isConnected || !this.pool) {
            throw new Error('MySQL not connected');
        }

        const cleanEmail = String(email).trim().toLowerCase();
        const cleanUsername = String(username || email.split('@')[0]).trim().toLowerCase();
        const cleanName = String(name || cleanUsername).trim();

        // Check if user already exists
        const existing = await this.findUserByIdentifier(cleanEmail);
        if (existing) {
            throw new Error('An account with this email address or username already exists in MySQL.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await this.pool.query(
            'INSERT INTO users (name, username, email, password, phone, user_type) VALUES (?, ?, ?, ?, ?, ?)',
            [cleanName, cleanUsername, cleanEmail, hashedPassword, phone || '+91 99999 00000', userType || 'STUDENT']
        );

        return {
            id: result.insertId,
            name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            phone: phone || '+91 99999 00000',
            userType: userType || 'STUDENT',
            createdAt: new Date().toISOString()
        };
    }

    async verifyUserPassword(identifier, plainPassword) {
        const user = await this.findUserByIdentifier(identifier);
        if (!user) return null;

        // Compare bcrypt hash
        let match = false;
        try {
            match = await bcrypt.compare(plainPassword, user.password);
        } catch (e) {
            match = false;
        }

        // Support plain password fallback for development seed compatibility
        if (!match && user.password === plainPassword) {
            match = true;
        }

        if (!match) return null;

        return {
            id: user.id,
            name: user.name,
            fullName: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            userType: user.user_type || 'STUDENT'
        };
    }

    async syncComplaint(c) {
        if (!this.isConnected || !this.pool) return;
        try {
            await this.pool.query(`
                INSERT INTO complaints 
                (complaint_id, permanent_id, institution_name, category, subject, description, status, priority, assigned_bureau, assigned_officer, last_action, next_action, sla_deadline, days_remaining, is_sla_breached, complainant_email, complainant_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                last_action = VALUES(last_action),
                next_action = VALUES(next_action),
                assigned_officer = VALUES(assigned_officer)
            `, [
                c.complaintId,
                c.permanentId,
                c.institutionName,
                c.category,
                c.subject,
                c.description,
                c.status,
                c.priority,
                c.assignedBureau,
                c.assignedOfficer || 'Pending Allocation',
                c.lastAction,
                c.nextAction,
                c.slaDeadline || '2026-03-30',
                c.daysRemaining || 30,
                c.isSlaBreached ? 1 : 0,
                c.complainantEmail,
                c.complainantName
            ]);
        } catch (err) {
            console.error('[MySQL] syncComplaint error:', err.message);
        }
    }
}

const mysqlClient = new MySqlClient();
module.exports = mysqlClient;
