import { useNavigate } from "react-router"
import { useEffect } from "react";


const withAuth =(WrappedComponent)=>{

    const AuthComponent = (props)=>{

    const router = useNavigate();
    const isAuthenticated = ()=>{
        if(localStorage.getItem("token")){  
    return true;        
        }
        return false;
    }
    useEffect(()=>{
        if(!isAuthenticated){
            router("/auth");
        }
    },[])
        return <WrappedComponent {...props}/>
    }

    return AuthComponent;

};

export default withAuth;