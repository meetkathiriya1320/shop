import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

// Check if we should use SQLite for development (when MySQL is not available)
const USE_SQLITE = process.env.USE_SQLITE === 'true' || process.env.NODE_ENV === 'production';

let pool;

// Create SQLite database wrapper
class SQLitePool {
  constructor(dbPath = process.env.DATABASE_PATH || './database.sqlite') {
    this.dbPath = dbPath;
    this.db = null;
    this.connected = false;
  }

  async connect() {
    if (this.connected) return;

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('SQLite connection error:', err);
          reject(err);
        } else {
          this.connected = true;
          console.log('✅ Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async execute(sql, params = []) {
    if (!this.connected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      // Handle SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve([rows, { insertId: rows.length > 0 ? rows[0].id : null }]);
          }
        });
      } else {
        // Handle INSERT, UPDATE, DELETE queries
        this.db.run(sql, params, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve([{ affectedRows: this.changes }, { insertId: this.lastID }]);
          }
        });
      }
    });
  }

  async getConnection() {
    if (!this.connected) {
      await this.connect();
    }
    return {
      release: () => {
        // SQLite doesn't need connection release
      }
    };
  }

  async end() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing SQLite database:', err);
          } else {
            this.connected = false;
            console.log('SQLite database connection closed');
          }
          resolve();
        });
      });
    }
  }
}

if (USE_SQLITE) {
  console.log('🗄️  Using SQLite database (production/development fallback)');
  console.log('   Set USE_SQLITE=false in .env to use MySQL\n');

  pool = new SQLitePool();

  // Test connection on startup
  pool.connect().catch(err => {
    console.error('Failed to connect to SQLite:', err);
  });

} else {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shope',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
  };

  console.log('🔧 Database configuration:');
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   Password: ${dbConfig.password ? '***' : '(empty)'}\n`);

  pool = mysql.createPool(dbConfig);
}

export default pool;