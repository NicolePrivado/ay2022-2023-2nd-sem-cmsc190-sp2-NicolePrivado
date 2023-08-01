import { useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import { TbGridDots } from 'react-icons/tb'
import { FiUpload } from 'react-icons/fi'
import { RiFileList3Line } from 'react-icons/ri'
import { TbBrandGoogleAnalytics } from 'react-icons/tb';
import { BsMegaphone } from 'react-icons/bs';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineQuestionAnswer } from 'react-icons/md'
import "../style/menu.css"

const MenuItems = () => {
    const navigate = useNavigate();
    return(
        <div className = 'menu-items'>
            <div className = "menu-items-body">
                <div className = "menu-item-box" style = {{ marginLeft: '4px', width: '30%'}} onClick={() => {navigate("/upload")}}>
                    <FiUpload size = {25} className = "menu-item-icon" /> <br /> 
                    <span> UPLOAD </span>
                </div>
                <div className = "menu-item-box" style = {{ width: '30%'}} onClick={() => {navigate("/notices")}}>
                    <RiFileList3Line size = {25} className = "menu-item-icon"/> <br /> 
                    <span> NOTICES </span>
                </div>
                <div className = "menu-item-box" style = {{ width: '37%'}} onClick={() => {navigate("/announcements")}}>
                    <BsMegaphone size = {25} className = "menu-item-icon"/> <br /> 
                    <span style = {{ fontSize: '10px'}} > ANNOUNCEMENTS </span>
                </div>
            </div>
            <div className = "menu-items-body">
                <div className = "menu-item-box" style = {{ width: '33%'}} onClick={() => {navigate("/analytics")}}>
                    <TbBrandGoogleAnalytics size = {25} className = "menu-item-icon"/> <br /> 
                    <span> ANALYTICS </span>
                </div>
                <div className = "menu-item-box" style = {{ width: '33%'}} onClick={() => {navigate("/directory")}}>
                    <HiOutlineUserGroup size = {25} className = "menu-item-icon"/> <br /> 
                    <span> DIRECTORY </span>
                </div>
                <div className = "menu-item-box" style = {{ width: '33%'}} onClick={() => {navigate("/inquiries")}}>
                    <MdOutlineQuestionAnswer size = {25} className = "menu-item-icon"/> <br /> 
                    <span> INQUIRIES </span>
                </div>
            </div>
        </div>
    )  
}

const Menu = () => {
    const[show_menu, set_show_menu] = useState(false);
    return(
        <div> 
            <TbGridDots size = {35} className = "menu-icon" onClick = {() => {set_show_menu(!show_menu)}} />
            {show_menu? <div> <div className = 'menu-bg' onClick = {() => {set_show_menu(!show_menu)}} /> <MenuItems /> </div> : ""}
        </div>
    );
}

export default Menu;