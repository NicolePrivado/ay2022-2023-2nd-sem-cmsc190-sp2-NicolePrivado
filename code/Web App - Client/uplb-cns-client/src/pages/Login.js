import React, { useEffect } from'react';
import { Footer } from '../components/'
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { ToastContainer, toast } from 'react-toastify';
import useStore from '../components/AuthHook'
import app_logo from '../images/sp_app_logo.png'
import web_bg from '../images/web_bg.jpg'
import '../style/login.css'

const Login = () => {
    const { user, isAuthenticated, setAuth } = useStore();
    const navigate = useNavigate();

    //checks if user is already logged in
    useEffect(()=>{
        if (!user && !isAuthenticated) {

            fetch('https://uplb-cns-server.onrender.com/auth/refresh',
                { method: 'GET', credentials: 'include' }
            )
            .then(res => res.json() )
            .then(body => {
                if (body.success) {
                setAuth(body.user, body.success)
                navigate('/home')
            }
                else {
                navigate('/');
                }
            })
            .catch(e => toast(e.toString(), {type:'error', position:'top-center', hideProgressBar: true, closeButton: false}))
            }
    },[])
    // Login function to send token to server
    const responseGoogle = (response) => {
        fetch('https://uplb-cns-server.onrender.com/auth/',{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                credential: response.credential
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success){
                setAuth(json.user, json.success)
                navigate('/home')
            }
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false}) 
        })
        .catch(e => {console.log(e.toString());toast(e.toString(), {type:'error', position:'top-center', hideProgressBar: true, closeButton: false})})
    };

    return(
        <div className='login-container'> 
            <img src = {web_bg} className='login-bg'/>
            <img src = {app_logo} className='login-logo'/>
            <div className='login-btn-container'>
                <GoogleLogin
                    size={500}
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                />
            </div>
            <Footer />
            <ToastContainer />
        </div>
    );
}

export default Login;