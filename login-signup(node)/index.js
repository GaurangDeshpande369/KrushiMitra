const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const templatePath = path.join(__dirname, './templates');

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "hbs");
app.set("views", templatePath);

// ✅ MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'krushimitra_users' // Make sure this database exists in MySQL
});

db.connect((err) => {
    if (err) {
        console.error("❌ Error connecting to MySQL:", err);
    } else {
        console.log("✅ Connected to MySQL database");
    }
});

// ✅ Render Login Page
app.get("/", (req, res) => {
    res.render("login");
});

// ✅ Render Signup Page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// ✅ Handle Login Request
app.post("/login", (req, res) => {
    const { phone, password } = req.body;

    // Ensure the exact match with case sensitivity
    const query = "SELECT * FROM user_info WHERE BINARY Phone_number = ? AND BINARY password = ?";
    db.query(query, [phone, password], (err, results) => {
        if (err) {
            console.error("❌ Error querying database:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length > 0) {
            res.render("dashboard"); // ✅ Redirect to Dashboard
        } else {
            res.send("❌ Invalid Credentials");
        }
    });
});

// ✅ Handle Signup Request
app.post("/signup", (req, res) => {
    const { phone, password } = req.body;

    const checkQuery = "SELECT * FROM user_info WHERE Phone_number = ?";
    db.query(checkQuery, [phone], (err, results) => {
        if (err) {
            console.error("Error checking database:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        if (results.length > 0) {
            return res.send("Phone number already registered. Please use a different one.");
        }

        const insertQuery = "INSERT INTO user_info (Phone_number, password) VALUES (?, ?)";
        db.query(insertQuery, [phone, password], (err, result) => {
            if (err) {
                console.error("Error inserting into database:", err);
                return res.status(500).json({ message: "Internal Server Error" });
            }
            res.redirect("/dashboard");  // Redirect to dashboard on successful signup
        });
    });
});

// ✅ Render Dashboard Page
app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

// ✅ Start Server
app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});
