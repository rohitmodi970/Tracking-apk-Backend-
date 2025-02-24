const mongoose = require("mongoose");

const UserDeatilsSchema = new mongoose.Schema({
    name:String,
    email:{type: String,unique:true},
    mobile: String,
    password: String,
},{
    collection:"UserDetails"
});

mongoose.model("UserDetails",UserDeatilsSchema)