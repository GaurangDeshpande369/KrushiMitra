const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

// Initialize the Express app
const app = express();
app.use(bodyParser.json()); // To parse JSON request body

// Create the MySQL connection
const db = mysql.createConnection({
  host: 'localhost',        // Database host
  user: 'root',             // Database user
  password: '',             // Database password
  database: 'krushimitra_users'  // Database name
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// Function to check if the phone number exists and validate the password
function checkPhoneNumberAndPassword(phoneNumber, password, callback) {
  const query = 'SELECT * FROM user_info WHERE Phone_number = ?';
  db.execute(query, [phoneNumber], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length > 0) {
      // Phone number exists, check the password
      if (results[0].password === password) {
        return callback(null, { message: 'Login successful, redirecting to dashboard.' });
      } else {
        return callback({ message: 'Incorrect password' }, null);
      }
    } else {
      return callback({ message: 'Phone number does not exist' }, null);
    }
  });
}

// Function to insert a new phone number and password into the table
function insertPhoneNumberAndPassword(phoneNumber, password, callback) {
  const query = 'INSERT INTO user_info (Phone_number, password) VALUES (?, ?)';
  db.execute(query, [phoneNumber, password], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, { message: 'User successfully registered.' });
  });
}

// POST route to check if phone number exists and validate password
app.post('/login', (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).send({ message: 'Phone number and password are required.' });
  }

  checkPhoneNumberAndPassword(phoneNumber, password, (err, result) => {
    if (err) {
      return res.status(400).send(err);
    }
    return res.status(200).send(result);
  });
});

// POST route to register a new phone number and password if it doesn't exist
app.post('/register', (req, res) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).send({ message: 'Phone number and password are required.' });
  }

  // First, check if the phone number already exists
  const checkQuery = 'SELECT * FROM user_info WHERE Phone_number = ?';
  db.execute(checkQuery, [phoneNumber], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Database error.' });
    }
    if (results.length > 0) {
      return res.status(400).send({ message: 'Phone number already exists.' });
    }

    // If phone number doesn't exist, insert it
    insertPhoneNumberAndPassword(phoneNumber, password, (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Error registering user.' });
      }
      return res.status(200).send(result);
    });
  });
});

// Start the Express server on port 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
