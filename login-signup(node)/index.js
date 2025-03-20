const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the "public" folder

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'krushimitra_users'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Serve the login/register page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle login & registration
app.post('/auth', (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ message: 'Phone number and password are required.' });
  }

  const checkQuery = 'SELECT * FROM user_info WHERE Phone_number = ?';

  db.execute(checkQuery, [phoneNumber], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error.' });
    }

    if (results.length > 0) {
      // Phone number exists, check password
      if (results[0].password === password) {
        return res.status(200).json({ message: 'Login successful, redirecting to dashboard.' });
      } else {
        return res.status(401).json({ message: 'Incorrect password.' });
      }
    } else {
      // Phone number not found, register user
      const insertQuery = 'INSERT INTO user_info (Phone_number, password) VALUES (?, ?)';

      db.execute(insertQuery, [phoneNumber, password], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Error registering user.' });
        }
        return res.status(200).json({ message: 'Registration successful, redirecting to dashboard.' });
      });
    }
  });
});

// Serve the dashboard page
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Logout route (redirects back to login page)
app.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
