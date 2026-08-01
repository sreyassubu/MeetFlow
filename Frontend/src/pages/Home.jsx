import React from 'react'
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import '../styles/Home.css';
import { useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Home() {

const navigate = useNavigate();
const [meetingCode, setMeetingCode] = useState("");
const {addToUserHistory} = useContext(AuthContext);

//Logout 
const handleLogOut = ()=>{
    localStorage.removeItem("token");
    navigate("/auth")
}

//Meeting code
const handleJoinMeet = async ()=>{
    if(localStorage.getItem("token")){
        await addToUserHistory(meetingCode);
    }
    navigate(`/${meetingCode}`);
}


  return (
    <div className="homeContainer">
      <nav className='homeNav'>
        <Link to={"/"} style={{textDecoration: "none",fontSize: "2rem",fontWeight: "bold",color: "#1976d2"}}>
        MeetFlow
        </Link>

        <div className="navRight">
          <IconButton onClick={()=>navigate("/history")}>
            <RestoreIcon />
            <span>History</span>
          </IconButton>

          

          <Button variant="outlined" onClick={handleLogOut}>
            Log out
          </Button>
        </div>
      </nav>

      <div className="meetContainer">
        <div className="leftPanel">
          <h1>Premium video meetings for everyone.</h1>

          <p>
            Join or create secure meetings in seconds.
          </p>

          <div className="joinSection">
            <TextField label="Meeting Code" variant="outlined" size="small"
            onChange={(e)=>setMeetingCode(e.target.value)}/>

            <Button variant="contained" onClick={handleJoinMeet}>
              Join
            </Button>
          </div>
        </div>

        <div className="rightPanel">
          <img src="/logo3.png" alt="MeetFlow" />
        </div>
      </div>
    </div>
  );
}
