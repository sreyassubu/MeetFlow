import dotenv from "dotenv";
dotenv.config();

import express from "express";
import {createServer} from "node:http";
import mongoose from "mongoose";
import cors from "cors";

import connectToSocket from "./src/controllers/socketManager.js";
import userRouter from "./src/routes/user.routes.js";



const app = express();
const server = createServer(app);
const io = connectToSocket(server);

//Built-in MWs
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({extended:true}));

//DB connection
const DB_url = process.env.ATLASDB_URL;
main()
.then(()=> console.log("Atlas DB connected"))
.catch(err => console.log(err));


async function main() {
  await mongoose.connect(DB_url);
}

//Routes
app.use("/users",userRouter);

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});