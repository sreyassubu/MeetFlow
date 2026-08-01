import React from 'react'
import { useEffect, useRef } from 'react'
import styles from "../styles/RemoteVideo.module.css"

export default function RemoteVideo({stream,displayName}) {

    const videoRef = useRef(null)
    useEffect(()=>{
        if(videoRef.current){
            videoRef.current.srcObject = stream; 
        }
    },[stream])
  return (
    <div className={styles.remoteVideoContainer}>
    <video 
        ref={videoRef}
        autoPlay
        playsInline
        className={styles.remoteVideo}
    />

    <div className={styles.displayName}>
        {displayName}
    </div>
</div>
  )
}
