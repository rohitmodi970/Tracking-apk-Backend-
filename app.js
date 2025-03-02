const express = require("express");
const cors = require("cors");
const app = express();


// ✅ Allow frontend to communicate with backend
app.use(cors({
    origin: "*",  // Allows all origins (Change to your frontend URL in production)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

const mongoose = require("mongoose")
app.use(express.json())
const bcrypt = require("bcryptjs")
// const mongoUrl = "mongodb://localhost:27017/my-expo-app"
require('dotenv').config();
const mongoUrl = process.env.MONGODB_URI;
const jwt = require('jsonwebtoken')//it will help us to generate a token each and every time when user register and that token will be unique and that token will contain the user data in the encrypted format
const JWT_SECRET = "ksjdbfkjsadbnflkjqbedfiu2rt7rgkjhsdfiog8iy21q30rjrolkj*^&^$%ifgh21q938e831e4ru8e0934r8t098r5utg8345y89^&%#***Ugxxhcasdf2430r5428905t6712-03`=1233-`13d";

app.get("/test", (req, res) => {
    res.json({ message: "CORS is working!" });
});

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
        const token = jwt.sign({ email: oldUser.email }, JWT_SECRET);

        return res.status(201).send({ status: "ok", data: token, userType: oldUser.userType });
    } catch (error) {
        // console.error("Login error:", error);
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
        // console.log(useremail)
        // Find user in database
        const userData = await User.findOne({ email: useremail }).select("-password"); // Exclude password
        // console.log(userData)
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
//this will store the location of the user in the database of time interval inluding lastest one and time gap of 10 min,30 min,1 hour,6 hour,12 hour and 1 day
// Update to the update-location endpoint to manage isActive
app.post("/update-location", async (req, res) => {
    try {
      const { token, latitude, longitude, isActive = true } = req.body;
      
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
      
      const currentTime = new Date();
      const newLocation = {
        latitude,
        longitude,
        timestamp: currentTime
      };
      
      // Find or create user's location document
      let userLocation = await Location.findOne({ userId: userData.userId });
      let isNewRecord = false;
      
      if (!userLocation) {
        // Initialize new document
        userLocation = new Location({
          userId: userData.userId,
          userName: userData.name,
          isActive: isActive,
          currentLocation: newLocation,
          intervals: {
            tenMinutes: newLocation,
            thirtyMinutes: newLocation,
            oneHour: newLocation,
            sixHours: newLocation,
            twelveHours: newLocation,
            oneDay: newLocation
          },
          lastUpdated: currentTime
        });
        isNewRecord = true;
      } else {
        // Update current location, username, and active status
        userLocation.currentLocation = newLocation;
        userLocation.userName = userData.name;
        userLocation.isActive = isActive;
        
        // Check and update each interval if enough time has passed
        const intervals = [
          { name: 'tenMinutes', milliseconds: 10 * 60 * 1000 },
          { name: 'thirtyMinutes', milliseconds: 30 * 60 * 1000 },
          { name: 'oneHour', milliseconds: 60 * 60 * 1000 },
          { name: 'sixHours', milliseconds: 6 * 60 * 60 * 1000 },
          { name: 'twelveHours', milliseconds: 12 * 60 * 60 * 1000 },
          { name: 'oneDay', milliseconds: 24 * 60 * 60 * 1000 }
        ];
        
        intervals.forEach(interval => {
          const lastUpdate = userLocation.intervals[interval.name]?.timestamp || new Date(0);
          if (currentTime - new Date(lastUpdate) >= interval.milliseconds) {
            userLocation.intervals[interval.name] = newLocation;
          }
        });
      }
      
      userLocation.lastUpdated = currentTime;
      await userLocation.save();
      
      return res.status(200).json({
        status: "ok",
        message: isNewRecord ? "Location created successfully" : "Location updated successfully",
        data: userLocation
      });
    } catch (error) {
      console.error("Location update error:", error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  });
  


// Backend API endpoint to get all active users' current locations
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
      
      // Get all active users' current locations only
      const activeLocations = await Location.find({ isActive: true })
        .select({
          userId: 1,
          userName: 1,
          currentLocation: 1,
          lastUpdated: 1
        })
        .sort({ lastUpdated: -1 });
      
      // Format the response to provide just the current location data
      const formattedLocations = activeLocations.map(loc => ({
        userId: loc.userId,
        userName: loc.userName,
        latitude: loc.currentLocation.latitude,
        longitude: loc.currentLocation.longitude,
        timestamp: loc.currentLocation.timestamp,
        lastUpdated: loc.lastUpdated
      }));
      
      return res.status(200).json({
        status: "ok",
        data: formattedLocations
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
const BatteryStatus = require("./models/UserBattery");

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Battery db connected"))
  .catch((e) => console.log(e));

  app.post("/updateBatteryStatus", async (req, res) => {
    const { token, batteryLevel, isCharging } = req.body;
    // console.log(token);
    // console.log(req.body);
    
    try {
      // Decode JWT token to get user info
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findOne({ email: decoded.email });
  
      if (!user) {
        return res.status(401).json({ error: "Invalid user" });
      }
  
      // Only update if userType is "user" (case insensitive)
      if (user.userType.toLowerCase() !== "user") {
        return res.status(403).json({ error: "Only standard users can update battery status" });
      }
  
      // Update BatteryStatus model
      await BatteryStatus.findOneAndUpdate(
        { userId: user.userId },
        { 
          level: batteryLevel, 
          isCharging: isCharging,
          updatedAt: new Date() 
        },
        { upsert: true, new: true }
      );
  
      console.log(`Battery status updated for user ${user.userId}: ${batteryLevel}%, Charging: ${isCharging}`);
      
      res.json({ 
        success: true, 
        message: "Battery status updated successfully" 
      });
    } catch (error) {
      console.error("Error updating battery status:", error);
      res.status(500).json({ error: "Server error" });
    }
  });



  app.post("/fetchAllUsers", async (req, res) => {
    const { token } = req.body;
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const adminUser = await User.findOne({ email: decoded.email });
  
      if (!adminUser || adminUser.userType.toLowerCase() !== "admin") {
        return res.status(403).json({ error: "Only admin users can fetch all users" });
      }
  
      // Fetch all users with `isActive` status
      const users = await User.find({}, "name email mobile userType isActive"); 
  
      res.json({ success: true, data: users });
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  app.post(`/user/mobile`, async (req, res) => {
    const { token, mobile } = req.body;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const adminUser = await User.findOne({ email: decoded.email });
    
      if (!adminUser || adminUser.userType.toLowerCase() !== "admin") {
      return res.status(403).json({ error: "Only admin users can fetch all users" });
      }
      const userData = await User.findOne({
      mobile: mobile
      });
      if (!userData) {
      return res.status(404).json({ error: "User not found" });
      }
      const locationData = await Location.findOne({
      userId: userData.userId
      });
      const batteryData = await BatteryStatus.findOne({
      userId: userData.userId
      });

      // Decrypt the password
      // const decryptedPassword = await bcrypt.compare(userData.password, userData.password);
      const decryptedPassword = await bcrypt.decodeBase64(userData.password);

      // console.log("User data:", userData);
      // console.log("Location data:", locationData);
      // console.log("Battery data:", batteryData);
      // console.log("Decrypted password:", decryptedPassword);
      // res.json({ success: true, data: { userData, locationData, batteryData, decryptedPassword } });
      res.json({ success: true, data: { userData, locationData, batteryData } });
    } catch (error) {
      console.error("Error fetching user by mobile:", error);
      res.status(500).json({ error: "Server error" });
    }
  });