import React from 'react'
import { useRef, useState, useEffect } from 'react';
import RemoteVideo from './RemoteVideo';
import styles from "../styles/VideoMeet.module.css";
import io from 'socket.io-client'
import { Badge, IconButton, TextField, Button } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

//Backend socket.io server
const server_url = "http://localhost:3000";

const connections = {};

//STUN server connect
const peerConfigConnections = {
  "iceServers": [
    {"urls":"stun:stun.l.google.com:19302"}
  ]
}

export default function VideoMeet() {

  //Refs
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef(null);
  const chatAreaRef = useRef(null);

  //Contexts
  const {name} = useContext(AuthContext);

  //States
  //Video & audio permissions
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [audioAvailable, setAudioAvailable] = useState(false);

  //Video & audio in the meeting 
  const [video, setVideo] = useState();
  const [audio, setAudio] = useState();

  //Screen media
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [screen, setScreen] = useState();

  //List of remote videos
  const [videos, setVideos] = useState([]);

  //Message
  const [message,setMessage] = useState("");
  const [messages,setMessages] = useState([]);
  const [newMessages, setNewMessages] = useState(0);

  //Others
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState(null);

  //Effects
  useEffect(()=>{
    getPermissions();
  },[])

  //Set the local stream to the local video element when user enters meeting
  useEffect(()=>{
    if(!askForUsername && localVideoRef.current && window.localStream){
      localVideoRef.current.srcObject = window.localStream;
    }
  },[askForUsername])

  //Whenever user sets video or audio options, run this
  useEffect(()=>{
    if(video!==undefined && audio!==undefined){
      updateMediaState();
    }
  },[video,audio])

  //When user shares or stops sharing screen, run this
  useEffect(()=>{
    if(screen!=undefined){
      getScreenDisplayMedia();
    }
  },[screen])

  //Scroll chat to the latest message automatically
  useEffect(()=>{
    if(chatAreaRef.current){
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  })

  const getPermissions = async ()=>{
    let hasVideo = false;
    let hasAudio = false;
    let videoStream;
    let audioStream;

    //Video permission
    try{
      videoStream = await navigator.mediaDevices.getUserMedia({video:true});
      if(videoStream){
        setVideoAvailable(true);
        hasVideo = true;
      }
    } catch(err){
      setVideoAvailable(false);
      hasVideo = false;
    }

    //Audio permission
    try{
      audioStream = await navigator.mediaDevices.getUserMedia({audio:true});
      if(audioStream){
        setAudioAvailable(true);
        hasAudio = true;
      }
    } catch(err){
      setAudioAvailable(false);
      hasAudio = false;
    }

    //Screen share availability
    if(navigator.mediaDevices.getDisplayMedia){
      setScreenAvailable(true);
    }
    else{
      setScreenAvailable(false);
    }

    //Saving media
    let videoTrack;
    let audioTrack;
    try{
      //Video track
      if(hasVideo){
        videoTrack = videoStream.getVideoTracks()[0];
      }
      else{
        videoTrack = black();
      }

      //Audio track
      if(hasAudio){
        audioTrack = audioStream.getAudioTracks()[0];
      }
      else{
        audioTrack = silence();
      }

      //Creating and saving media
      const userMediaStream = new MediaStream([videoTrack,audioTrack]);
      window.localStream = userMediaStream;
      if(localVideoRef.current){
        localVideoRef.current.srcObject = userMediaStream;
      }
      
      //When camera or mic stops working
      userMediaStream.getTracks().forEach(track=>{
        attachTrackEnded(track);
      });
    }
    catch(err){
      console.log(err);
    }      
  }

  //Attach track ended
  const attachTrackEnded = (track)=>{
    track.onended = ()=>{
      if(track.kind === "video"){
        setVideo(false);
      }
      else if(track.kind === "audio"){
        setAudio(false);
      }
    }
  }

// Set video and audio according to permissions given and connect to backend
const getMedia = ()=>{
  setVideo(videoAvailable);
  setAudio(audioAvailable);
  connectToSocketServer();
}

//Send the media that the user has chosen to send
const updateMediaState = ()=>{
  //If no media
  if(!window.localStream) return;
  //Extract video and audio tracks
  const videoTrack = window.localStream.getVideoTracks()[0];
  const audioTrack = window.localStream.getAudioTracks()[0];

  //Enable or disable the tracks
  if(videoTrack) videoTrack.enabled = video;
  if(audioTrack) audioTrack.enabled = audio;
}

const getScreenDisplayMedia = async ()=>{
  if(screen){
    //Get screen stream
    let screenStream;
    try{
      screenStream = await navigator.mediaDevices.getDisplayMedia({video:true});
      //Extract track
      const screenTrack = screenStream.getVideoTracks()[0];
      //Replace local video
      localVideoRef.current.srcObject = screenStream;
      //Replace the track being sent to every peer connection
      Object.values(connections).forEach((connection)=>{
        //Get the RTCRtp sender which sends video track for each connection
        const sender = connection.getSenders().find(sender=>sender.track?.kind === "video");
        if(sender){
          sender.replaceTrack(screenTrack);
        }
      });
      //Attach onended for screen display track
      screenTrack.onended = ()=>{
        setScreen(false);
      }
    } catch(e){
        console.log(e)
        setScreen(false);
      }
  }
  else{
    //Extract video track
    const cameraTrack = window.localStream.getVideoTracks()[0];
    //Replace local video
    localVideoRef.current.srcObject = window.localStream;
    //Replace the track being sent to every peer connection
    Object.values(connections).forEach((connection)=>{
      //Get the RTCRtp sender which sends video track for each connection
      const sender = connection.getSenders().find(sender=>sender.track?.kind === "video");
      if(sender){
        sender.replaceTrack(cameraTrack);
      }
    })
  }
}

//Respond to offer with answer and store the ice candidates sent by server
let gotMessageFromServer = (fromId, message)=>{
  const signal = JSON.parse(message);

  //Response to sdp
  if(signal.sdp){
    connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
    .then(()=>{
      //Response to offer
      if(signal.sdp.type === 'offer'){
        connections[fromId].createAnswer()
        .then((answer)=>{
          connections[fromId].setLocalDescription(answer)
          .then(()=>{
            socketRef.current.emit('signal',fromId,JSON.stringify({'sdp':connections[fromId].localDescription}))
          }).catch(e=>console.log(e))  
        }).catch(e=>console.log(e))
      }
    }).catch(e=>console.log(e))
  }

  //Store ICE candidates
  if(signal.ice){
    connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
    .catch(e=>console.log(e));
  }
}

const connectToSocketServer = ()=>{
  //Connect to backend
  socketRef.current = io.connect(server_url,{secure:false});

  socketRef.current.on('signal',gotMessageFromServer);

  //When backend responds
  socketRef.current.on('connect',()=>{
    //User wants to join the call and passes meeting link
    socketRef.current.emit('join-call',{path:window.location.href,displayName:(username||name.name)})
    socketIdRef.current = socketRef.current.id;

    //Message listener (Adds the message received)
    socketRef.current.on('chat-message',addMessage)

    //User left
    socketRef.current.on('user-left',(id)=>{
      //Delete the connection socket with the user who left
      connections[id]?.close();
      delete connections[id];
      //Remove video of the user who left
      setVideos((videos)=>videos.filter(video=>video.socketId!==id))
    })

    //When user joins
    socketRef.current.on('user-joined',(id,clients)=>{
      clients.forEach((client)=>{
        //Ignore if connection already exists and dont create connection to yourself
        if(connections[client.socketId] || client.socketId===socketIdRef.current){
          return;
        }
        //Create RTC peer connection objects and store in connections
        connections[client.socketId] = new RTCPeerConnection(peerConfigConnections);

        //ICE candidate event listener
        connections[client.socketId].onicecandidate = (event)=>{
          if(event.candidate!=null){
            socketRef.current.emit('signal',client.socketId,JSON.stringify({'ice':event.candidate}))
          }
        }

        //Track listener (When client receives a remote track)
        connections[client.socketId].ontrack = (event)=>{
          const newVideo = {
            socketId:client.socketId, //From whom I received the stream from
            displayName:client.displayName,
            stream:event.streams[0], //Reconstruct the stream and add the track
            autoplay:true,
            playsInline:true
          }
          setVideos(videos=>{
            //Check if video of incoming track already exists
            const exists = videos.find(video=>video.socketId===client.socketId)
            if(exists) return videos;
            return [...videos,newVideo];
          })
        }

        //Get tracks from local stream and add them
        if(window.localStream!==null){
          try{
            window.localStream.getTracks().forEach((track)=>{
              //Adding tracks
              connections[client.socketId].addTrack(track,window.localStream); //Returns RTCRtp sender object
            })
          } catch(e){
            console.log(e);
          }
        }
      });

      //Create offer for SDP negotiation
      if(id===socketIdRef.current){
        for(const id2 in connections){
          connections[id2].createOffer()
          .then((description)=>{
            connections[id2].setLocalDescription(description)
            .then(()=>{
              //Send offer to server
              socketRef.current.emit('signal',id2,JSON.stringify({'sdp':connections[id2].localDescription}))
            }).catch(e=>console.log(e)) 
          }).catch(e=>console.log(e))
        }
      }
    })
  });
}

//Silent audio track
const silence = () => {
        const ctx = new AudioContext()
        const oscillator = ctx.createOscillator()
        const dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}

//Black video track
const black = ({ width = 640, height = 480 } = {}) => {
        const canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        const stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
}

const handleScreen = ()=>{
  setScreen(!screen);
}

//Adding message
const addMessage = (data,sender,socketIdSender)=>{
  setMessages((prevMessages)=>[...prevMessages,{data,sender,socketIdSender}])

  //Setting new mesaages
  if(socketIdRef.current !== socketIdSender){
      setNewMessages((prevNewMessages)=> prevNewMessages+1);
  }
}

//Sending message
const sendMessage = ()=>{
  if(!name){
    socketRef.current.emit('chat-message',message,username);
  }
  else{
    socketRef.current.emit('chat-message',message,name.name);
  }
  setMessage("");
}

//Press enter to send message
const handleKeyDown = (e)=>{
  if(e.key === "Enter"){
    e.preventDefault(); //Prevents from going to next line
    sendMessage();
  }
}

const openChat = ()=>{
  setShowChat(!showChat);
  setNewMessages(0);
}

const handleVideo = ()=>{
  setVideo(!video);
}

const handleAudio = ()=>{
  setAudio(!audio);
}

const handleEndCall = ()=>{
  try{
    //Stop all your tracks
    const tracks = localVideoRef.current.srcObject.getTracks();
    tracks.forEach((track)=>track.stop())
    // Close every peer connection
    Object.values(connections).forEach((connection) => {
      connection.close();
    });
    // Delete the object that referred to the connection
    Object.keys(connections).forEach((id) => {
      delete connections[id];
    });
    //Disconnect the socket
    socketRef.current?.disconnect();

  } catch(e){console.log(e)}
  window.location.href = "/home"
}
 
const connect = ()=>{
  if(!username.trim() && !name){
    setError("Pls enter username");
    return;
  }
  setAskForUsername(false);
  getMedia();
}

  const remoteCount = videos.length;
  const remoteGridClass =
    remoteCount === 1 ? styles.remoteGridOne :
    remoteCount === 2 ? styles.remoteGridTwo :
    remoteCount === 3 ? styles.remoteGridThree :
    styles.remoteGridMany;

  return (
    <div>
      {/* Lobby */}
      {askForUsername===true?
      <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        <h2 className={styles.lobbyTitle}>Ready to Join?</h2>

        <div className={styles.videoPreview}>
            <video ref={localVideoRef} autoPlay muted
                style={{ transform: "scaleX(-1)" }}
            />
        </div>

        {!name && <TextField fullWidth label="Username" variant="outlined" value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.usernameField}
        />}

        <Button variant="contained" onClick={connect} className={styles.joinButton}>
            Join Meeting
        </Button>
        <p style={{color:"red"}}>{error}</p>
      </div>
   </div>
      :

      // Meeting page
      <div className={styles.meetVideoContainer}>

        {/* Chat room */}
        {showChat &&
        <div className={styles.chatRoom}>
          <div className={styles.chatContainer}>
            <h1>Chat</h1>
            <div className={styles.chatArea} ref={chatAreaRef}>
              {messages.length>0?messages.map((item,index)=>{
                return (
                  <div style={{marginBottom:"1rem"}} key={index}
                  className={`${item.socketIdSender === socketIdRef.current?styles.myMessage:styles.remoteMessage}`} >
                    <p style={{fontWeight:"bold"}}>{item.sender}</p>
                    <p>{item.data}</p>
                  </div>
                )
              }):<p>No messages</p>}
            </div>
            <div className={styles.textingArea}>
              <TextField id='outlined-basic' variant='outlined' label="Enter message" 
              fullWidth onChange={e=>setMessage(e.target.value)} value={message} onKeyDown={handleKeyDown}/>
              <IconButton onClick={sendMessage} color='primary' >
                <SendIcon style={{fontSize:"2rem"}}/>
              </IconButton>
            </div>
          </div> 
        </div>
        }

        {/* Local video */}
        <div className={`${styles.localVideoContainer} ${showChat ? styles.meetLocalVideoChat : ""}`}>
          <video className={styles.meetLocalVideo} ref={localVideoRef} autoPlay muted/>

          <div className={styles.displayName}>
            {name ? name.name : username}
          </div>

        </div>
 
        {/* Remote videos */}
	        <div className={`${styles.meetRemoteVideos} ${remoteGridClass}
	        ${showChat?styles.meetRemoteVideosChat:""}`}>
	          {videos.map((video)=>
	              <div key={video.socketId} className={styles.remoteVideoTile}>
	              <RemoteVideo stream={video.stream} displayName={video.displayName}></RemoteVideo>
	              </div>
	          )}
	        </div>

          {/* Control bar */}
        <div className={styles.controlBar}>
          <IconButton onClick={handleVideo} style={{color:'white'}}>
            {video===true?<VideocamIcon/>:<VideocamOffIcon/>}
          </IconButton>
          <IconButton onClick={handleAudio} style={{color:'white'}}>
            {audio===true?<MicIcon/>:<MicOffIcon/>}
          </IconButton>
          {screenAvailable===true?
          <IconButton onClick={handleScreen} style={{color:'white'}}>
            {screen===true?<ScreenShareIcon/>:<StopScreenShareIcon/>}
          </IconButton>:<></>}
          <Badge color='secondary' badgeContent={newMessages}>
            <IconButton onClick={openChat} style={{color:'white'}}>
              <ChatIcon style={{marginRight:0}}/>
            </IconButton>
          </Badge>
          <IconButton onClick={handleEndCall} style={{color:'red'}}>
            <CallEndIcon style={{marginLeft:"2rem"}}/>
          </IconButton>
        </div>
      </div>
      }
    </div>
  )
}
