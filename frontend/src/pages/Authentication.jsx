import React from 'react';
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Paper,
  Box,
  Grid,
  Snackbar,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';

const theme = createTheme();

export default function Authentication() {

  const [username,setUsername] = React.useState();
  const [password,setPassword] = React.useState();
  const [name,setName] = React.useState();
  const [message,setMessage] = React.useState();

  const [formState,setFormState] = React.useState(0);
  const [error,setError] = React.useState();
  const [open,setOpen] = React.useState(false);

  const {handleRegister, handleLogin} = React.useContext(AuthContext);

let handleAuth = async()=>{

  try{
    if(formState ===0){

        let result = await handleLogin(username,password);
        console.log(result);


    }
    if(formState===1){
      let result = await handleRegister(name,username,password);
      console.log(result);
      setUsername("");
      setMessage(result);
      setOpen(true);
      setError("");
      setFormState(0);
      setPassword("");

        
    }
  }
  catch(err){
    console.log(err);
    const message =
    err?.response?.data?.message ||
    err?.response?.data ||
    err?.message ||
    "An unexpected error occurred.";
  
    setError(message);
    

  }
}


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid container sx={{ height: '100vh' }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558567081-4225ac92dc2e?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: { xs: 'none', md: 'block' },
          }}
        />

      
        <Grid
          item
          xs={12}
          md={6}
          component={Paper}
          elevation={6}
          square
        >
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>

         <div>
          <Button variant={formState=== 0 ? "contained" : ""} onClick={()=>{setFormState(0)}}>
            Sign In
          </Button >
          <Button variant = {formState ===1 ? "contained":""} onClick={()=>{setFormState(1)}}>
            Sign Up
          </Button >
         </div>
            <Box
              component="form"
              noValidate
              sx={{ mt: 1 }}

            
            >
              {formState ===1 ?<TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Full Name"
                name="username"
                value={name}
                autoFocus
                onChange={(e)=>setName(e.target.value)}
              />: <></>}



              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={username}
                autoFocus
                onChange={(e)=>setUsername(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                value={password}
                label="Password"
                type="password"
                id="password"  onChange={(e)=>setPassword(e.target.value)}
              />
             <p style={{color :"red"}}>{error}</p>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
               {formState ===0? "Login" :"Register"}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>


      <Snackbar
        open = {open}
        autoHideDuration ={4000}
        message={message}
      />
    </ThemeProvider>
  );
}
