import React from 'react'
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {Snackbar} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useEffect } from 'react';

export default function History() {

    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const {getHistoryOfUser} = useContext(AuthContext);

    useEffect(()=>{
        const fetchHistory = async()=>{
            try{
            const meetingHistory = await getHistoryOfUser();
            setMeetings(meetingHistory);
            }
            catch(err){
                console.log(err);
            }
        }
        fetchHistory();
    },[])

    const formatDate = (dateString)=>{
        const date = new Date(dateString); //Fri Jul 31 2009 13:09:33 GMT+0530 (India Standard Time)
        const day = date.getDate().toString().padStart(2,"0"); //Extract day, make sure length is 2
        const month = (date.getMonth()+1).toString().padStart(2,"0") //Extract month, add 1 as JS month start from 0
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }


  return (
    <div>
      <IconButton onClick={()=>navigate("/home")}>
        <HomeIcon/>
      </IconButton>
    

    {meetings.length>0?meetings.map((meeting,index)=>{
        return (
            <>
                <Card key={index} variant='outlined'>
                    <CardContent>
                        <Typography sx={{fontSize:14}} color='text.secondary' gutterBottom>
                            MeetingCode: {meeting.meetingCode}
                        </Typography>
                        <Typography sx={{mb:1.5}} color='text.secondary'>
                            Date: {formatDate(meeting.date)}
                        </Typography>
                    </CardContent>
                </Card>
            </>
        )
    }):<p>No meetings</p>
    }
    </div>
  )
}

