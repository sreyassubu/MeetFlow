import express from "express";
import { registerUser, loginUser, addToHistory, getUserHistory } from "../controllers/users.controllers.js";
import {auth,validateMeeting,validateLoginUser,validateRegisterUser} from "../../utils/middlewear.js"

const router = express.Router();

router.route("/login")
.post(validateLoginUser,loginUser)

router.route("/register")
.post(validateRegisterUser,registerUser)

router.route("/addToActivity")
.post(auth,validateMeeting,addToHistory)

router.route("/getAllActivity")
.get(auth, getUserHistory)



export default router


