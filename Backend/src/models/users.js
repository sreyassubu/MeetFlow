import mongoose from "mongoose";
// import { use } from "react";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    }
})

const User = new mongoose.model("User",userSchema);
export {User}