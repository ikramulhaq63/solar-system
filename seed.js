require('dotenv').config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
    auth: {
        username: process.env.MONGO_USERNAME,
        password: process.env.MONGO_PASSWORD
    },
    authSource: 'admin'
}).then(() => {
    console.log("MongoDB Connected - Seeding Data...");
}).catch(err => console.log("DB Connection Error: " + err));

const planetSchema = new mongoose.Schema({
    id: Number,
    name: String,
    description: String,
    image: String,
    velocity: String,
    distance: String
});

const Planet = mongoose.model("planets", planetSchema);

async function seed() {
    await Planet.deleteMany({}); // clear old data
    await Planet.insertMany([
        {
            id: 1,
            name: "Mercury",
            description: "Mercury is the smallest planet in our solar system and closest to the Sun.",
            image: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg",
            velocity: "47.87 km/s",
            distance: "57.9 million km"
        },
        {
            id: 2,
            name: "Venus",
            description: "Venus has a thick, toxic atmosphere and surface temperatures hot enough to melt lead.",
            image: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg",
            velocity: "35.02 km/s",
            distance: "108.2 million km"
        },
        {
            id: 3,
            name: "Earth",
            description: "Earth is the only planet known to support life, with vast oceans and diverse ecosystems.",
            image: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
            velocity: "29.78 km/s",
            distance: "149.6 million km"
        },
        {
            id: 4,
            name: "Mars",
            description: "Mars is the red planet, home to the tallest volcano and deepest canyon in the solar system.",
            image: "https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg",
            velocity: "24.07 km/s",
            distance: "227.9 million km"
        },
        {
            id: 5,
            name: "Jupiter",
            description: "Jupiter is the largest planet with a giant storm known as the Great Red Spot.",
            image: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg",
            velocity: "13.07 km/s",
            distance: "778.5 million km"
        },
        {
            id: 6,
            name: "Saturn",
            description: "Saturn is famous for its stunning ring system made of ice and rock.",
            image: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg",
            velocity: "9.69 km/s",
            distance: "1.4 billion km"
        },
        {
            id: 7,
            name: "Uranus",
            description: "Uranus rotates on its side, making its seasons extreme.",
            image: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg",
            velocity: "6.81 km/s",
            distance: "2.9 billion km"
        },
        {
            id: 8,
            name: "Neptune",
            description: "Neptune is a windy, icy giant with supersonic winds.",
            image: "https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg",
            velocity: "5.43 km/s",
            distance: "4.5 billion km"
        }
    ]);
    console.log("Seeding Complete 🌍✅");
    process.exit();
}

seed();
