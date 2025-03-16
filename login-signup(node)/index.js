const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors'); // ✅ Allow requests from Android App

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // ✅ Enable CORS to allow Android app requests

// ✅ MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'krushimitra_users'
});

db.connect((err) => {
    if (err) {
        console.error("❌ Error connecting to MySQL:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

// ✅ Handle Signup Request (API for Android)
app.post("/signup", (req, res) => {
    const { phone, password } = req.body;

    const checkQuery = "SELECT * FROM user_info WHERE Phone_number = ?";
    db.query(checkQuery, [phone], (err, results) => {
        if (err) {
            console.error("❌ Error checking database:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Phone number already registered." });
        }

        const insertQuery = "INSERT INTO user_info (Phone_number, password) VALUES (?, ?)";
        db.query(insertQuery, [phone, password], (err, result) => {
            if (err) {
                console.error("❌ Error inserting into database:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            res.status(201).json({ message: "Signup successful!" });
        });
    });
});

// ✅ Handle Login Request (API for Android)
app.post("/login", (req, res) => {
    const { phone, password } = req.body;

    const query = "SELECT * FROM user_info WHERE Phone_number = ?";
    db.query(query, [phone], (err, results) => {
        if (err) {
            console.error("❌ Error querying database:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length > 0) {
            if (results[0].password === password) {
                res.status(200).json({ message: "Login successful!" });
            } else {
                res.status(401).json({ message: "Incorrect password." });
            }
        } else {
            res.status(404).json({ message: "Phone number not registered." });
        }
    });
});

// ✅ Start Server
app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
