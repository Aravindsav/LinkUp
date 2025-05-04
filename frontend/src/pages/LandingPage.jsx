import React from 'react'
import "../App.css";
import { Link, useNavigate } from 'react-router-dom';





export default function LandingPage() {

    const router = useNavigate();
  return (
    <div className='landingPageContainer'>
        <nav>
            <div className='navHeader'>

          <h2>LinkUp</h2>

            </div>
            <div className='navlist'>
                <p onClick={()=>{
                    router("/random123")
                }}>Join as a Guest</p>
                <p onClick={()=>{
                    router("/auth");
                }}>Register</p>
                <div role='button' onClick={()=>{
                    router("/auth")
                }}>
                    <p>Login</p>
                </div>
            </div>
        
        </nav>
        <div className="landingMainContainer">

            <div>
                <h1> <span style={{color:"#FF9838"}}>Connect</span> with your Loved Ones</h1>
                <p style={{marginBlockStart:"1rem"}}>Feel Closer, Even When You're Far.</p>
                <div  role='button'>
                    <Link to={"/auth"}> Get Started </Link>
                </div>
            </div>
            <div>
                <img src='/mobile.png' alt=''  className='glow-image'></img>
                
            </div>


        </div>

    </div>
  )
}
