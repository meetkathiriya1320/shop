import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class User {
    constructor(id, name, email, password, role, addressStreet, addressCity, addressState, addressZip, addressCountry, createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.addressStreet = addressStreet;
        this.addressCity = addressCity;
        this.addressState = addressState;
        this.addressZip = addressZip;
        this.addressCountry = addressCountry;
        this.createdAt = createdAt;
    }

    // Instance method to compare password
    async comparePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Static method to find user by ID
    static async findById(id) {
        try {
            const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new User(row.id, row.name, row.email, row.password, row.role, row.address_street, row.address_city, row.address_state, row.address_zip, row.address_country, row.created_at);
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Static method to find user by email
    static async findByEmail(email) {
        try {
            const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (rows.length === 0) return null;
            const row = rows[0];
            return new User(row.id, row.name, row.email, row.password, row.role, row.address_street, row.address_city, row.address_state, row.address_zip, row.address_country, row.created_at);
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    // Static method to create a new user
    static async create(name, email, password, role = 'user', addressStreet = null, addressCity = null, addressState = null, addressZip = null, addressCountry = null) {
        try {
            const hashedPassword = await bcrypt.hash(password, 8);
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, role, address_street, address_city, address_state, address_zip, address_country, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
                [name, email, hashedPassword, role, addressStreet, addressCity, addressState, addressZip, addressCountry]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    // Static method to create the users table if it doesn't exist (for migration)
    static async createTableIfNotExists() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'user',
                    address_street VARCHAR(255),
                    address_city VARCHAR(100),
                    address_state VARCHAR(100),
                    address_zip VARCHAR(20),
                    address_country VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await pool.execute(createTableQuery);

            // Add role column if it doesn't exist (for existing tables)
            try {
                await pool.execute('ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT \'user\'');
            } catch (alterError) {
                // Column might already exist, ignore error
                console.log('Role column check completed.');
            }

            // Add address columns if they don't exist (for existing tables)
            try {
                await pool.execute('ALTER TABLE users ADD COLUMN address_street VARCHAR(255)');
                await pool.execute('ALTER TABLE users ADD COLUMN address_city VARCHAR(100)');
                await pool.execute('ALTER TABLE users ADD COLUMN address_state VARCHAR(100)');
                await pool.execute('ALTER TABLE users ADD COLUMN address_zip VARCHAR(20)');
                await pool.execute('ALTER TABLE users ADD COLUMN address_country VARCHAR(100)');
            } catch (alterError) {
                // Columns might already exist, ignore error
                console.log('Address columns check completed.');
            }

            console.log('Users table created or updated with role and address columns.');
        } catch (error) {
            console.error('Error creating/updating users table:', error);
            throw error;
        }
    }
}

// Automatically create the table upon model import (migration)
User.createTableIfNotExists().catch(err => {
    console.error('Failed to create users table:', err);
});

// Add a sample user if it doesn't exist
User.addSampleUserIfNotExists = async () => {
    try {
        const sampleUser = {
            name: 'Admin User',
            email: 'admin@shop.com',
            password: 'admin123',
            role: 'admin'
        };

        // Check if user exists
        const existingUser = await User.findByEmail(sampleUser.email);
        if (existingUser) {
            console.log('Sample admin user already exists.');
            return;
        }

        // Try to create the user
        try {
            await User.create(sampleUser.name, sampleUser.email, sampleUser.password, sampleUser.role);
            console.log('Sample admin user added to the database.');
        } catch (createError) {
            // If creation fails due to duplicate entry, it's probably already created by another process
            if (createError.code === 'ER_DUP_ENTRY' || createError.code === 'SQLITE_CONSTRAINT') {
                console.log('Sample admin user already exists (created by another process).');
            } else {
                throw createError;
            }
        }
    } catch (error) {
        console.error('Error adding/updating sample user:', error);
    }
};

User.addSampleUserIfNotExists().catch(err => {
    console.error('Failed to add sample user:', err);
});

export default User;