import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import Category from './src/models/Category.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    let connection;

    try {
        // Connect to MySQL server (without specifying a database)
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected to MySQL server');

        // Read and execute the SQL file
        const sqlFilePath = path.join(__dirname, 'database.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        // Split SQL commands and execute them
        const sqlCommands = sql.split(';').filter(cmd => cmd.trim().length > 0);

        for (const command of sqlCommands) {
            if (command.trim()) {
                await connection.execute(command);
                console.log('Executed SQL command successfully');
            }
        }

        console.log('Database setup completed successfully!');

        // Switch to the shope database
        await connection.execute('USE shope');

        // Check if tables exist
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables in shope database:', rows.map(row => Object.values(row)[0]));

        // Drop the unique constraint on ratings table if it exists
        try {
            await connection.execute('ALTER TABLE ratings DROP INDEX IF EXISTS unique_user_category');
            console.log('Dropped unique constraint on ratings table.');
        } catch (dropError) {
            console.log('Unique constraint may not exist or could not be dropped:', dropError.message);
        }

        // Create a sample user
        console.log('Creating sample user...');
        const sampleUser = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123'
        };

        // Check if user already exists
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [sampleUser.email]
        );

        if (existingUsers.length === 0) {
            // Hash the password
            const hashedPassword = await bcrypt.hash(sampleUser.password, 10);

            // Insert the sample user
            const [result] = await connection.execute(
                'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
                [sampleUser.name, sampleUser.email, hashedPassword]
            );

            console.log(`Sample user created successfully!`);
            // console.log(`Email: ${sampleUser.email}`);
            // console.log(`Password: ${sampleUser.password}`);
            // console.log(`User ID: ${result.insertId}`);
        } else {
            console.log('Sample user already exists, skipping creation.');
        }

    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Database connection closed');
        }
    }
}

// Run the setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupDatabase();
}

export default setupDatabase;