const mongoose = require("mongoose");
const locationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Register the model
mongoose.model("Location", locationSchema);