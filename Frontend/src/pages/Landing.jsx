import React from 'react'
import "../App.css"
import {Link} from "react-router-dom";
import {Button} from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import "../styles/Landing.css";

export default function Landing() {

    const {setName} = useContext(AuthContext);

    //If user is logged in and clicks join as guest, remove the user
    const removeUser = ()=>{
        if(localStorage.getItem("token")){
            localStorage.removeItem("token");
            setName(null);
        }  
    }

  return (
    <div className='landingPageContainer'>
      {/* Navbar */}
      <nav>
        <div className="nav-header">
            <h2>MeetFlow</h2>
        </div>
        <div className="nav-list">
            <Button onClick={removeUser} sx={{ textTransform: "none" }}>
                <Link to={"/home"}>Join as guest</Link>
            </Button>
            <Link to={"/auth"}><p>Register / Login</p></Link>
        </div>
      </nav>
    
    {/* Main-container */}
    <div className="landingMainContainer">
        <div>
            <h1><span style={{color:"#FF9839"}}>Connect</span> Collaborate Create</h1>
            <p>Where conversations become collaboration</p>
            <div role='button'>
                <Link to={"/auth"}>Get started</Link>
            </div>
        </div>
        <div>
            <img src="/mobile.png" alt="mobile-img" />
        </div>
    </div>

    </div>
  )
}
