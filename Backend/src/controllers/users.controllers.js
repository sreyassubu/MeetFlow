import {User} from "../models/users.js";
import status from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Meeting } from "../models/meetings.js";

dotenv.config();


const registerUser = async(req,res)=>{
    const {name, username, password} = req.body;
    if(!name || !username || !password){
        return res.status(400).json({message:"Please provide details"});
    }

    //Check if user exists
    try{
    const existingUser = await User.findOne({username});
    if(existingUser){
        return res.status(status.CONFLICT).json({message:"User already exists"});
    }

    const hashedPassword = await bcrypt.hash(password,10);
    const newUser = new User({
        name,username,
        password:hashedPassword
    });
    await newUser.save();
    res.status(status.CREATED).json({message:"User created"});
    } catch(err){
        res.status(500).json({message:`Something went wrong ${err}`});
    }
}

const loginUser = async(req,res)=>{
    const {username, password} = req.body;

    try{
        const user = await User.findOne({username});
        if(!user){
            return res.status(status.NOT_FOUND).json({message:"User not found"});
        }
        if(await bcrypt.compare(password,user.password)){
            //Create JWT Token
            const token = jwt.sign(
                {userId:user._id,
                 username:user.username
                }, process.env.JWT_SECRET, //Sign using secret key
                {
                    expiresIn:"7d"
                }
            );
            return res.status(status.OK).json({token,name:user.name});
        }
        else{
            return res.status(status.UNAUTHORIZED).json({message:"Invalid credentials"});
        }
    } catch(err){
        res.status(500).json({message:`Internal server error`});
    }
}

const addToHistory = async(req,res)=>{
    try{
    const {meetingCode} = req.body;
    //Create new meeting info
    const newMeeting = new Meeting({user_id:req.user.username,meetingCode});
    await newMeeting.save();
    res.status(status.CREATED).json({message:"Added meetingCode to history"});
    } catch(e){
        res.status(401).json({message:`Something went wrong ${e}`});
    }
}

const getUserHistory = async(req,res)=>{
    //Get user's meetings
    try{
    const meetings = await Meeting.find({user_id:req.user.username});
    res.status(status.OK).json({meetings});
    } catch(err){
        res.status(401).json({message:`Something went wrong ${err}`});
    }
}

export {loginUser, registerUser, addToHistory, getUserHistory};