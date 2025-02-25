const express = require("express");
const app = express();

const mongoose = require("mongoose")
app.use(express.json())
const bcrypt = require("bcryptjs")
// const mongoUrl = "mongodb://localhost:27017/my-expo-app"
require('dotenv').config();
const mongoUrl = process.env.MONGODB_URI;
const jwt = require('jsonwebtoken')//it will help us to generate a token each and every time when user register and that token will be unique and that token will contain the user data in the encrypted format
const JWT_SECRET = "ksjdbfkjsadbnflkjqbedfiu2rt7rgkjhsdfiog8iy21q30rjrolkj*^&^$%ifgh21q938e831e4ru8e0934r8t098r5utg8345y89^&%#***Ugxxhcasdf2430r5428905t6712-03`=1233-`13d";

mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log("Database connected");
    }).catch((e) => {
        console.log(e)
    })
require('./models/UserDetails')
const User = mongoose.model("UserDetails")
app.get("/", (req, res) => {
    res.send({ status: "Started" });
});

app.post("/register", async (req, res) => {
    const { name, email, password, mobile, userType } = req.body;
    const olduser = await User.findOne({ email: email });
    if (olduser) {
        return res.send({ data: "User already exists!!" })
    }

    const encryptedPassword = await bcrypt.hash(password, 10)
    try {
        await User.create({
            // name:name,
            // email:email,
            // password:password,
            // password:encryptedPassword,
            // mobile:mobile,
            //or we can write name like this 
            name,
            email,
            password: encryptedPassword,
            mobile,
            userType
        })
        res.send({ status: "ok", data: "User Created Successfully" })
    } catch (e) {
        res.send({ status: "error", data: "Error" })
    }
})



app.post("/login-user", async (req, res) => {
    try {
        const { identifier, password } = req.body; // Accepting 'identifier' instead of 'email'

        const oldUser = await User.findOne({
            $or: [{ email: identifier }, { mobile: identifier }] // Allow login via email or mobile
        });

        if (!oldUser) {
            return res.status(404).send({ message: `User ${identifier} doesn't exist!` });
        }

        const isMatch = await bcrypt.compare(password, oldUser.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ email: oldUser.email }, JWT_SECRET, { expiresIn: "1h" });

        return res.status(201).send({ status: "ok", data: token, userType: oldUser.userType });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send({ message: "Internal Server Error" });
    }
});
app.post("/userdata", async (req, res) => {
    const { token } = req.body;

    try {
        if (!token) {
            return res.status(400).json({ status: "error", data: "Token is required" });
        }

        // Verify token and extract user email
        const user = jwt.verify(token, JWT_SECRET);
        const useremail = user.email;
        console.log(useremail)
        // Find user in database
        const userData = await User.findOne({ email: useremail }).select("-password"); // Exclude password
        console.log(userData)
        if (!userData) {
            return res.status(404).json({ status: "error", data: "User not found" });
        }

        // Send user data (excluding password)
        return res.status(200).json({ status: "ok", data: userData });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})




app.listen(5001, () => {
    console.log("Node js server started.")
})

// Add this to your existing app.js file
mongoose
    .connect(mongoUrl)
    .then(() => {
        console.log("Location Database connected");
    }).catch((e) => {
        console.log(e)
    })
require('./models/Location',)


const Location = mongoose.model("Location");

// API to update user location
app.post("/update-location", async (req, res) => {
    try {
        const { token, latitude, longitude } = req.body;

        if (!token || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        // Verify user from token
        const user = jwt.verify(token, JWT_SECRET);
        const userEmail = user.email;

        // Get user details
        const userData = await User.findOne({ email: userEmail });
        if (!userData) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Only users with userType='User' can share location
        if (userData.userType !== 'User') {
            return res.status(403).json({
                status: "error",
                message: "Only users with 'User' role can share location"
            });
        }

        // Update or create location entry
        const locationUpdate = await Location.findOneAndUpdate(
            { userId: userData._id },
            {
                userId: userData._id,
                userName: userData.name,
                latitude,
                longitude,
                timestamp: new Date(),
                isActive: true
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            status: "ok",
            message: "Location updated successfully",
            data: locationUpdate
        });
    } catch (error) {
        console.error("Location update error:", error);
        return res.status(500).json({ status: "error", message: error.message });
    }
});

// API to get all active user locations (for admin)
app.post("/get-all-locations", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ status: "error", message: "Token is required" });
        }

        // Verify admin from token
        const user = jwt.verify(token, JWT_SECRET);
        const userEmail = user.email;

        // Verify user is admin
        const userData = await User.findOne({ email: userEmail });
        if (!userData || userData.userType !== 'Admin') {
            return res.status(403).json({
                status: "error",
                message: "Access denied. Admin privileges required"
            });
        }

        // Get all active locations
        const allLocations = await Location.find({ isActive: true })
            .sort({ timestamp: -1 });

        return res.status(200).json({
            status: "ok",
            data: allLocations
        });
    } catch (error) {
        console.error("Get locations error:", error);
        return res.status(500).json({ status: "error", message: error.message });
    }
});

// API to stop sharing location
app.post("/stop-location-sharing", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ status: "error", message: "Token is required" });
        }

        // Verify user from token
        const user = jwt.verify(token, JWT_SECRET);
        const userEmail = user.email;

        // Get user details
        const userData = await User.findOne({ email: userEmail });
        if (!userData) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Update location to inactive
        await Location.findOneAndUpdate(
            { userId: userData._id },
            { isActive: false }
        );

        return res.status(200).json({
            status: "ok",
            message: "Location sharing stopped"
        });
    } catch (error) {
        console.error("Stop location sharing error:", error);
        return res.status(500).json({ status: "error", message: error.message });
    }
});