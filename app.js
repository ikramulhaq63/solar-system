require('dotenv').config();
const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
    user: process.env.MONGO_USERNAME,
    pass: process.env.MONGO_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ MongoDB Connection Successful");
}).catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
});

const Schema = mongoose.Schema;

const dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
const Planet = mongoose.model('planets', dataSchema);

// 🔥 FIXED: async/await instead of callback
app.post('/planet', async (req, res) => {
    try {
        const planetData = await Planet.findOne({ id: req.body.id });

        if (!planetData) {
            return res.status(404).json({ error: "Planet not found" });
        }

        res.json(planetData);
    } catch (err) {
        console.error("Error fetching planet:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});

app.get('/os', (req, res) => {
    res.json({
        os: OS.hostname(),
        env: process.env.NODE_ENV
    });
});

app.get('/live', (req, res) => {
    res.json({ status: "live" });
});

app.get('/ready', (req, res) => {
    res.json({ status: "ready" });
});

// Only start server if not running under tests
if (require.main === module) {
    app.listen(3000, () => {
        console.log("🚀 Server running on port 3000");
    });
}

module.exports = app;