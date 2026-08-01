import jwt from "jsonwebtoken";
import  {registerUserSchema, meetingSchema, loginSchema}  from "./schemaValidation.js";

export const auth = (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization; //Extract header
        
        //Backend safety net (when token is not there)
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message:"Unauthorized"});
        }
        //Extract token from header
        const token = authHeader.split(" ")[1];
        //Decode the JWT token
        const payload = jwt.verify(token,process.env.JWT_SECRET); //Returns payload
        req.user = payload;
        next();
    } catch(e){
        return res.status(401).json({message:"Invalid or expired token"}); 
    }
}

export const validateRegisterUser = (req,res,next)=>{
    const result = registerUserSchema.validate(req.body);
    if(result.error){
        return res.status(404).json({message:result.error.details[0].message});
    }
    next();
}

export const validateLoginUser = (req,res,next)=>{
    const result = loginSchema.validate(req.body);
    if(result.error){
        return res.status(404).json({message:result.error.details[0].message});
    }
    next();
}

export const validateMeeting = (req,res,next)=>{
    const result = meetingSchema.validate(req.body);
    if(result.error){
        return res.status(404).json({message:result.error.details[0].message});
    }
    next();
}

