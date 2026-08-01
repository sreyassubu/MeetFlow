import { useContext } from "react";
import { useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Avatar, Box, createTheme, CssBaseline, Paper, ThemeProvider, Button, TextField, Snackbar } from '@mui/material';
import { Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';


//Theme
const theme = createTheme();

export default function Authentication(){
    //Hooks
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [formState, setFormState] = useState(0);
    const [open, setOpen] = useState(false);

    //Handling signup and login
    let {handleRegister, handleLogin} = useContext(AuthContext);
    let handleAuth = async ()=>{
        try{
            if(formState===1){
                const result = await handleRegister(name,username,password);
                setUsername("");
                setName("");
                setPassword("");
                setError("")
                setMessage(result);
                setOpen(true);
                setFormState(0);
            }
            else{
                await handleLogin(username,password);
                setError("");
            }
        }
        catch(err){
            setError(err.response?.data?.message || "Something went wrong");
            setPassword("");
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Grid container component="main"sx={{height:'100vh'}}>

                {/* Bg-image */}
                <Grid size={{xs:false, sm:4, md:7}} sx={{
                    backgroundImage: "url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
                    backgroundRepeat: 'no-repeat',
                    backgroundSize:'cover',
                    backgroundPosition: 'center',
                    backgroundColor: (theme)=>
                        theme.palette.mode==="light"?theme.palette.grey[50]:theme.palette.grey[900]
                }} />

                {/* Signup & Signin form */}
                <Grid size={{xs:12, sm:8, md:5}} component={Paper} elevation={6} square>
                    <Box sx={{my:8,
                              mx:4,
                              display:'flex',
                              flexDirection:'column',
                              alignItems:'center'}}>
                        <Avatar sx={{m:1, backgroundColor:'secondary.main'}}>
                            <LockOutlinedIcon/>
                        </Avatar>

                        <div>
                            <Button variant={formState===0?"contained":""} onClick={()=>{setFormState(0); setError("")}}>Sign in</Button>
                            <Button variant={formState===1?"contained":""} onClick={()=>{setFormState(1); setError("")}}>Sign up</Button>
                        </div>

                        <Box component="form" noValidate sx={{mt:1}} onSubmit={(e)=>{
                            e.preventDefault();
                            handleAuth();
                        }}>
                            {/* Name field */}
                            {formState===1?<TextField
                            margin="normal" required fullWidth id="name" name="name" label="Full name" value={name}
                            autoFocus={formState===1} onChange={(e)=>setName(e.target.value)}
                            />:null}

                            {/* Username field */}
                            <TextField margin="normal" required fullWidth id="username" label="Username" value={username}
                            autoFocus={formState===0} onChange={(e)=>setUsername(e.target.value)}
                            />

                            {/* Password field */}
                            <TextField margin="normal" required fullWidth id="password" label="Password" value={password}
                            type="password" onChange={(e)=>setPassword(e.target.value)}
                            />

                            {/* Print error */}
                            {error && (<p style={{color:"red"}}>{error}</p>)}
                            
                            {/* Login & Register button */}
                            <Button type="submit" variant="contained" fullWidth sx={{mt:3, mb:2}}>
                                {formState===1?"Register":"Login"}
                            </Button>

                            <Snackbar open={open} autoHideDuration={4000} message={message}
                            onClose={()=>setOpen(false)}/>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    )
    
}