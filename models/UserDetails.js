const mongoose = require("mongoose");
const Counter = require("./Counter");
const UserDetailsSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    name: String,
    email: { type: String, unique: true },
    mobile: String,
    password: String,
    userType: String,
}, {
    collection: "UserDetails"
});
UserDetailsSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isNew) return next(); // Only generate userId for new users

    try {
        // Find and update the counter, increasing the sequence by 1
        const counter = await Counter.findByIdAndUpdate(
            { _id: "userId" }, // Counter name
            { $inc: { seq: 1 } }, // Increment the sequence
            { new: true, upsert: true } // Create if not exists
        );
        user.userId = counter.seq; // Assign the new sequence to userId
        next();
    } catch (error) {
        next(error);
    }
});
const UserDetails = mongoose.model("UserDetails", UserDetailsSchema);
module.exports = UserDetails;