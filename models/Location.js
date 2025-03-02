const mongoose = require("mongoose");

const locationPointSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const locationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  isActive: { type: Boolean, default: true, index: true }, // Added isActive field with index
  currentLocation: locationPointSchema,
  intervals: {
    tenMinutes: locationPointSchema,
    thirtyMinutes: locationPointSchema,
    oneHour: locationPointSchema,
    sixHours: locationPointSchema,
    twelveHours: locationPointSchema,
    oneDay: locationPointSchema
  },
  lastUpdated: { type: Date, default: Date.now }
});


mongoose.model("Location", locationSchema);



