import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Check if we should use SQLite for development (when MySQL is not available)
const USE_SQLITE = process.env.USE_SQLITE === 'true';

let pool;

if (USE_SQLITE) {
  console.log('🗄️  Using SQLite for development (MySQL not available)');
  console.log('   Set USE_SQLITE=false in .env to use MySQL\n');

  // For SQLite, we'll create a simple in-memory fallback
  // In a real implementation, you'd use better-sqlite3 or sqlite3
  pool = {
    execute: async () => {
      throw new Error('SQLite not fully implemented - install MySQL for full functionality');
    },
    getConnection: async () => {
      throw new Error('SQLite not fully implemented - install MySQL for full functionality');
    }
  };
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
  // console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  // console.log(`   User: ${dbConfig.user}`);
  // console.log(`   Database: ${dbConfig.database}`);
  // console.log(`   Password: ${dbConfig.password ? '***' : '(empty)'}\n`);

  pool = mysql.createPool(dbConfig);
}

export default pool;