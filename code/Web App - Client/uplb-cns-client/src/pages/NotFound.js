import React, { } from'react';
import { Footer } from '../components'
import { useNavigate } from 'react-router-dom';
import { ToastContainer,} from 'react-toastify';
import app_logo from '../images/sp_app_logo.png'
import web_bg from '../images/web_bg.jpg'
import '../style/notfound.css'

const NotFound = () => {
    const navigate = useNavigate()
    return(
        <div className='login-container'> 
            <img src = {web_bg} className='login-bg'/>
            <img src = {app_logo} className='notfound-logo'/>
            <h1 className='oops'>OOPS! </h1>
            <h1 className='oops-text'>404 Page not Found</h1>
            <button className = "notfound-btn" onClick={()=> navigate('/')}>Go to Page</button>
            <Footer />
            <ToastContainer />
        </div>
    );
}

export default NotFound;