
import { Server } from 'socket.io';


const connectToSocket = (server)=>{
    const io = new Server(server,{
        cors:{
            origin:"*",
            methods: ["GET","POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });
    const connection = {};
    const messages = {};
    const timeOnLine = {};
    
    io.on("connection", (socket)=>{
        console.log("something connected")
        //Join call
        socket.on("join-call",({path,displayName})=>{
            if(connection[path] == undefined){
                connection[path] = [];
            }
            //Add user in meeting
            connection[path].push({socketId:socket.id,displayName});
            console.log(connection);
            //update user time of joining
            timeOnLine[socket.id] = new Date();

            //Notify every user about the new user joining
            for(let i=0; i<connection[path].length; i++){
                io.to(connection[path][i].socketId).emit("user-joined",socket.id,connection[path])
            }

            //Make chat history of the meeting available to new user
            if(messages[path]!==undefined){
                console.log(messages[path]);
                for(let i=0; i<messages[path].length; i++){
                    io.to(socket.id).emit("chat-message",
                        messages[path][i]["data"],
                        messages[path][i]["sender"], //username of sender
                        messages[path][i]["socket-id-sender"]
                    );
                }
            }
        })

        //Forward ice candidates or sdp offer/answer to client
        socket.on('signal',(toId,message)=>{
            //Forward message and fromId to toId
            io.to(toId).emit('signal',socket.id,message); 
        })

        //Chat-message
        socket.on("chat-message", (data,sender)=>{
            //Find which room user is in
           const [matchingRoom,found] = Object.entries(connection).reduce(([room,isFound],[roomKey, roomValue])=>{
                if(!isFound && roomValue.some((participant)=>participant.socketId === socket.id)){
                    return [roomKey,true];
                }
                return [room,isFound];
            },['',false]);

            //Update the messages object with the message
            if(found){
                if(messages[matchingRoom]===undefined){
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({"sender":sender,"data":data,"socket-id-sender":socket.id});
            }
            else return;

            //Send message to all users in the meetingRoom
            connection[matchingRoom].forEach((element)=>{
                io.to(element.socketId).emit("chat-message",data,sender,socket.id);
            })
        })

        socket.on("disconnect",(reason)=>{
            console.log(socket.id, "disconnected:", reason);
            //Time spent by user in meeting
            let diffTime = Math.abs(timeOnLine[socket.id] - new Date());
            delete timeOnLine[socket.id]; 

            //Remove user from meeting
            for(const[k,v] of Object.entries(connection)){
                for(let i=0; i<v.length; i++){
                    if(v[i].socketId===socket.id){
                        //Removing user
                        connection[k].splice(i,1);
                        //Inform others in meeting that user left
                        for(let j=0; j<connection[k].length; j++){
                            io.to(connection[k][j].socketId).emit("user-left",socket.id);
                        }
                        //If meeting is empty delete the meeting
                        if(connection[k].length==0){
                            delete connection[k];
                            delete messages[k];
                        }
                        break;
                    }
                }
            }
        })
    })

    return io;
}

export default connectToSocket;