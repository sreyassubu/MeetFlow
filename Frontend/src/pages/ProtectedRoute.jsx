import React from 'react'
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({children}) {
    const token = localStorage.getItem("token"); 
    //Check if token is there
    if(!token){
       return <Navigate to="/auth" replace/>; //replace the old link with auth
    }

    return children;
}
