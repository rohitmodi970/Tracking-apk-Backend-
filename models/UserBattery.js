const mongoose = require("mongoose");

const BatteryStatusSchema = new mongoose.Schema({
    userId: { type: Number, ref: "UserDetails", required: true },
    level: { type: Number, min: 0, max: 100 },
    isCharging: { type: Boolean },
    updatedAt: { type: Date, default: Date.now }
});

const BatteryStatus = mongoose.model("BatteryStatus", BatteryStatusSchema);
module.exports = BatteryStatus;
