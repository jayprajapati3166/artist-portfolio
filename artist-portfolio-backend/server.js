console.log("🔥 CONFIRMED: server.js is running");

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors({
  origin: "*"
}));

app.use(express.json());


console.log("Connecting to PostgreSQL...");

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool
  .connect()
  .then(() => {
    console.log("✅ PostgreSQL connected successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ PostgreSQL connection failed");
    console.error(err.message);
    process.exit(1);
  });

// --------------------
// Enquiries API
// --------------------
app.post("/api/enquiries", async (req, res) => {
  const { name, phone, email, service_type, message } = req.body;

  if (!name || !phone || !service_type) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO enquiries (name, phone, email, service_type, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, phone, email || null, service_type, message || null]
    );

    res.status(201).json({ success: true, enquiry: result.rows[0] });
  } catch (err) {
    console.error("Error inserting enquiry:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/enquiries", authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM enquiries ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching enquiries:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// --------------------
// Admin Login API
// --------------------
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 🔐 CREATE JWT
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      token,
    });

  }  catch (err) {
  console.error("🔥 ADMIN LOGIN ERROR FULL OBJECT:");
  console.error(err);   // 👈 IMPORTANT
  res.status(500).json({ error: "Server error" });
}

});

app.patch("/api/enquiries/:id/contacted", authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE enquiries SET contacted = true WHERE id = $1",
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


app.patch(
  "/api/enquiries/:id/contacted",
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      await pool.query(
        "UPDATE enquiries SET contacted = true WHERE id = $1",
        [id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Update error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);
