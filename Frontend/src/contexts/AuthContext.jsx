import axios from "axios";
import { useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import status from "http-status";


//Create auth context
export const AuthContext = createContext({});


const client = axios.create({
    baseURL:"http://localhost:3000/users"
})

export default function AuthProvider({children}){
    //Define user state
    const [name, setName] = useState(null);

    //Define router for navigation
    const navigate = useNavigate();

    const handleRegister = async(name,username,password)=>{
        try{
            let response = await client.post("/register", {name,username,password});
            if(response.status === status.CREATED){
                return response.data.message;
            }
        }
        catch(err){
            throw err;
        }
    }

    const handleLogin = async(username, password)=>{
        try{
            let response = await client.post("/login", {username,password});
            if(response.status === status.OK){
            localStorage.setItem("token",response.data.token);
            setName({name:response.data.name});
            navigate("/home");
            }
        }
        catch(err){
            throw err;
        } 
    }

    const addToUserHistory = async(meetingCode)=>{
        try{
            let response = await client.post("/addToActivity",{
                meetingCode
            },
            {
                headers:{
                    Authorization: `Bearer ${localStorage.getItem("token")}` //Send the JWT token in header
                }
            }
        );
        return response;
        } catch(err){
            if(err.response?.status === 401){
                localStorage.removeItem("token");
                navigate("/auth");
            }
            console.log(err);
        }
    }

    const getHistoryOfUser = async()=>{
        try{
            let response = await client.get("/getAllActivity",{
                headers:{
                    Authorization: `Bearer ${localStorage.getItem("token")}` //Send JWT token in header
                }
            })
            return response.data.meetings;
        }
        catch(err){
            if(err.response?.status === 401){
                localStorage.removeItem("token");
                navigate("/auth");
            }
            throw err;
        }
    } 


    const data = {name, setName, handleRegister, handleLogin, addToUserHistory, getHistoryOfUser};

    return (
        //Load the provider component with data and return
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )


}