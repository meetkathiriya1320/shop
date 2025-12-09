# shope - Node.js Authentication API

A Node.js backend application with Express.js, MySQL, and JWT authentication.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT token-based authentication
- MySQL database integration
- ES6 modules support
- Error handling and proper HTTP status codes

## Prerequisites

- Node.js (v14 or higher)
- MySQL server (see installation instructions below)

## MySQL Installation (Required for Full Functionality)

### Windows
1. Download MySQL Installer from [MySQL official website](https://dev.mysql.com/downloads/installer/)
2. Run the installer and select "Developer Default" setup type
3. Follow the installation wizard
4. Set up a root password during installation
5. Make sure to start the MySQL service after installation

### macOS (using Homebrew)
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Alternative: XAMPP (Cross-platform)
1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Install and start XAMPP
3. Start the MySQL module from XAMPP control panel

### Quick Test
After installation, test MySQL connection:
```bash
mysql -h localhost -u root -p
```

## MySQL Installation (Required for Full Functionality)

### Windows
1. Download MySQL Installer from [MySQL official website](https://dev.mysql.com/downloads/installer/)
2. Run the installer and select "Developer Default" setup type
3. Follow the installation wizard
4. Set up a root password during installation
5. Make sure to start the MySQL service after installation

### macOS (using Homebrew)
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Alternative: XAMPP (Cross-platform)
1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Install and start XAMPP
3. Start the MySQL module from XAMPP control panel

### Quick Test
After installation, test MySQL connection:
```bash
mysql -h localhost -u root -p
```

## MySQL Installation (Required for Full Functionality)

### Windows
1. Download MySQL Installer from [MySQL official website](https://dev.mysql.com/downloads/installer/)
2. Run the installer and select "Developer Default" setup type
3. Follow the installation wizard
4. Set up a root password during installation
5. Make sure to start the MySQL service after installation

### macOS (using Homebrew)
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Alternative: XAMPP (Cross-platform)
1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Install and start XAMPP
3. Start the MySQL module from XAMPP control panel

### Quick Test
After installation, test MySQL connection:
```bash
mysql -h localhost -u root -p
```

## MySQL Installation

### Windows
1. Download MySQL Installer from [MySQL official website](https://dev.mysql.com/downloads/installer/)
2. Run the installer and select "Developer Default" setup type
3. Follow the installation wizard
4. Set up a root password during installation
5. Make sure to start the MySQL service after installation

### macOS (using Homebrew)
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Alternative: XAMPP (Cross-platform)
1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org/)
2. Install and start XAMPP
3. Start the MySQL module from XAMPP control panel

## Quick Start

1. **Install MySQL** (see MySQL Installation section below)
   - **Recommended**: Install XAMPP (includes phpMyAdmin)
   - Alternative: Install MySQL directly

2. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd shope
   npm install
   ```

3. **Configure environment** (update `.env` with your MySQL credentials):
   ```bash
   # Update these values in .env
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   ```

4. **Setup database** (choose one method):
   - **Automated**: `npm run setup-db` (creates everything automatically)
   - **phpMyAdmin**: Use the web interface (see Manual Setup section)
   - **MySQL Workbench**: Use the GUI tool (see Manual Setup section)

5. **Start server**:
   ```bash
   npm run dev       # Starts the server
   ```

6. **Test the API**:
   ```bash
   npm run test-api  # Tests all endpoints
   ```

## Detailed Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd shope
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Make sure MySQL server is running
   - Configure environment variables in `.env` file:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=shope
     JWT_SECRET=your_jwt_secret_key
     ```
   - Run the database setup script:
     ```bash
     npm run setup-db
     ```
     This will create the database, tables, and a sample user automatically.

4. Alternative manual database setup:
   - Create a MySQL database manually
   - Run the SQL script in `database.sql` to create the users table

### Manual Database Setup (Alternative)

If the automated setup doesn't work, you can manually create the database using one of these methods:

#### Option A: MySQL Command Line
1. **Start MySQL command line**:
   ```bash
   mysql -h localhost -u root -p
   ```

2. **Run the manual setup script**:
   ```sql
   SOURCE create-db.sql;
   ```

   Or copy and paste the contents of `create-db.sql` into your MySQL client.

3. **Verify setup**:
   ```sql
   USE shope;
   SHOW TABLES;
   SELECT * FROM users;
   ```

#### Option B: phpMyAdmin (Web Interface) - Quick Setup

If you have phpMyAdmin installed (comes with XAMPP/WAMP):

**Quick Method (Recommended)**:
1. **Open phpMyAdmin** in your browser (`http://localhost/phpmyadmin`)
2. **Copy the entire content** from `phpmyadmin-setup.sql` file
3. **Paste into SQL tab** and click "Go"

**Manual Method**:
1. **Open phpMyAdmin** in your browser (usually `http://localhost/phpmyadmin`)

2. **Create the database**:
   - Click "New" or "Databases" tab
   - Enter database name: `shope`
   - Click "Create"

3. **Create the users table**:
   - Select the `shope` database from the left sidebar
   - Click "SQL" tab at the top
   - Copy and paste this SQL:
     ```sql
     CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```
   - Click "Go"

4. **Insert sample user**:
   - Still in the SQL tab, run this query:
     ```sql
     INSERT INTO users (name, email, password, created_at) VALUES
     ('Admin User', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW());
     ```
   - Click "Go"

5. **Verify setup**:
   - Click on the `users` table in the left sidebar
   - Click "Browse" to see the sample user data

#### Option C: MySQL Workbench (GUI Tool)

1. **Open MySQL Workbench**
2. **Create new connection** (if needed) to localhost
3. **Create database**:
   - Right-click in the Schemas panel
   - Select "Create Schema"
   - Name: `shope`
   - Click "Apply"

4. **Create table**:
   - Expand the `shope` schema
   - Right-click on "Tables"
   - Select "Create Table"
   - Fill in table details:
     - Name: `users`
     - Add columns as specified in the SQL above
   - Click "Apply"

5. **Insert sample data** using the SQL queries above

### Manual Database Setup (Alternative)

If the automated setup doesn't work, you can manually create the database:

1. **Start MySQL command line**:
   ```bash
   mysql -h localhost -u root -p
   ```

2. **Run the manual setup script**:
   ```sql
   SOURCE create-db.sql;
   ```

   Or copy and paste the contents of `create-db.sql` into your MySQL client.

3. **Verify setup**:
   ```sql
   USE shope;
   SHOW TABLES;
   SELECT * FROM users;
   ```

### Manual Database Setup (Alternative)

If the automated setup doesn't work, you can manually create the database:

1. **Start MySQL command line**:
   ```bash
   mysql -h localhost -u root -p
   ```

2. **Run the manual setup script**:
   ```sql
   SOURCE create-db.sql;
   ```

   Or copy and paste the contents of `create-db.sql` into your MySQL client.

3. **Verify setup**:
   ```sql
   USE shope;
   SHOW TABLES;
   SELECT * FROM users;
   ```

## Sample User for Testing

After running `npm run setup-db`, a sample user is created with these credentials:

- **Email**: admin@example.com
- **Password**: password123

You can use this account to test the login functionality.

## Development Options

### SQLite for Development (No MySQL Required)

If you don't want to install MySQL for development, you can use SQLite mode:

1. Set `USE_SQLITE=true` in your `.env` file
2. The app will show SQLite mode messages and provide guidance
3. Note: Full database functionality requires MySQL

To switch back to MySQL, set `USE_SQLITE=false` and install MySQL.

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. **Verify MySQL is running**:
   - Windows: Check Services (services.msc) for MySQL service
   - macOS/Linux: `sudo systemctl status mysql` or `brew services list`

2. **Check credentials in `.env`**:
   - Ensure `DB_HOST`, `DB_USER`, `DB_PASSWORD` are correct
   - Default MySQL port is 3306

3. **Test MySQL connection manually**:
   ```bash
   mysql -h localhost -u root -p
   ```

4. **Firewall/Security**: Ensure MySQL port (3306) is not blocked

5. **Reset MySQL root password if needed**:
   ```bash
   sudo systemctl stop mysql
   sudo mysqld_safe --skip-grant-tables &
   mysql -u root
   UPDATE mysql.user SET authentication_string = PASSWORD('new_password') WHERE User = 'root';
   FLUSH PRIVILEGES;
   ```

### Common Errors

- **"ER_ACCESS_DENIED_ERROR"**: Check username/password in `.env`
- **"ECONNREFUSED"**: MySQL server is not running
- **"ER_BAD_DB_ERROR"**: Database doesn't exist, run `npm run setup-db`

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on port 3000 (or the port specified in the environment).

## Scripts Available

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run setup-db` - Set up the database and create tables
- `npm run test-api` - Test all API endpoints

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body**: `{ "name": "string", "email": "string", "password": "string" }`
- **Response**: `{ "message": "User registered successfully", "userId": number }`

#### Login User
- **POST** `/api/auth/login`
- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: `{ "message": "Login successful", "token": "jwt_token" }`

#### Protected Route Example
- **GET** `/api/protected`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: `{ "message": "This is a protected route", "user": user_object }`

## Project Structure

```
shope/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── authController.js    # Authentication controllers
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   └── User.js              # User model
│   └── routes/
│       └── auth.js              # Authentication routes
├── app.js                       # Main application file
├── setup-db.js                  # Automated database setup script
├── create-db.sql                # Manual database setup script
├── phpmyadmin-setup.sql         # phpMyAdmin quick setup script
├── database.sql                 # Database schema
├── package.json
├── .env                         # Environment variables
└── README.md
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - MySQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT token generation
- **dotenv** - Environment variable management
- **nodemon** - Development server#   s h o p  
 