import express from "express";
import {createServer} from "node:http";

import {Server} from "socket.io";

import mongoose from "mongoose";
import {connectToSocket} from "./controllers/socketManager.js"


import cors from "cors";
import userRoutes from "./routes/users.routes.js";


const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port",(process.env.PORT || 8000));

app.use(cors());

app.use(express.json({limit : "40kb"} ));
app.use (express.urlencoded({limit:"40kb",extended: true}));

app.use("/api/v1/users",userRoutes);

const start = async()=>{
    const connectionDB = await mongoose.connect("mongodb+srv://Aravind:Chinna2004%40@cluster0.r2mfzoc.mongodb.net/");
    console.log(`Mongo connected DB Host :${connectionDB.connection.host}`)
    server.listen(app.get("port"),()=>{
        console.log("Listening on Port 8000")
    });
}

start();