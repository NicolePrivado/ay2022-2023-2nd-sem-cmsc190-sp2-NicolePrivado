import { useNavigate } from 'react-router-dom';
import {
    AiOutlineHome,
    AiOutlineLogout
} from 'react-icons/ai';
import useStore from './AuthHook'
import uplb_logo from "../images/uplbcns.png"
import '../style/header.css';

const Header = () => {
    const navigate = useNavigate();
    const { setAuth } = useStore();

        // function for logging out the current user
    const userLogout=()=>{ 
    
        // finds the information of the currently logged in user 
        fetch('https://uplb-cns-server.onrender.com/auth' ,{
            method:'GET',
            credentials:'include'
        })
        .then(response => response.json())
        .then(() => {
            navigate('/');
            setTimeout(() => {
                setAuth(null, false);
            }, 500);
        })
    }
    return(
        <div className = "header-body"> 
            <div className = 'header-home'>   
                <AiOutlineHome size = {25} className = 'header-home-icon' onClick={() => {navigate("/home")}} />
                <span className = 'header-home-text' onClick={() => {navigate("/home")}}> HOME</span>
            </div>
            
            <img src = {uplb_logo} className = "header-logo" alt = "UPLB Logo" onClick={() => {navigate("/home")}} />
            
            <div className = 'header-logout'>
                <AiOutlineLogout size = {25} className = 'header-logout-icon' onClick={() => {userLogout()}} />
                <span className = 'header-logout-text' onClick={() => {userLogout()}}> SIGN OUT</span>
            </div>
            
        </div>
    );
}

export default Header;