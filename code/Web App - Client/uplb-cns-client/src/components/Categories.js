import { useNavigate } from 'react-router-dom';
import { FiUpload } from 'react-icons/fi'
import { RiFileList3Line } from 'react-icons/ri'
import { TbBrandGoogleAnalytics } from 'react-icons/tb';
import { BsMegaphone } from 'react-icons/bs';
import { HiOutlineUserGroup } from 'react-icons/hi';
import { MdOutlineQuestionAnswer } from 'react-icons/md'
import "../style/categories.css";
const Categories = () => {
    const navigate = useNavigate();
    return(
        <div className = 'categories-container'>
            <div className = "categories-body">
                <div className = "categories-box" onClick={() => {navigate("/upload")}}>
                    <FiUpload size = '32%' className = "categories-icon" /> <br /> 
                    <span> UPLOAD NOTICES </span>
                </div>
                <div className = "categories-box" onClick={() => {navigate("/notices")}}>
                    <RiFileList3Line size = '32%' className = "categories-icon"/> <br /> 
                    <span> NOTICES </span>
                </div>
                <div className = "categories-box" onClick={() => {navigate("/announcements")}}>
                    <BsMegaphone size = '32%' className = "categories-icon"/> <br /> 
                    <span> ANNOUNCEMENTS </span>
                </div>
                <div className = "categories-box" onClick={() => {navigate("/analytics")}}>
                    <TbBrandGoogleAnalytics size = '32%' className = "categories-icon"/> <br /> 
                    <span> ANALYTICS </span>
                </div>
                <div className = "categories-box" onClick={() => {navigate("/directory")}}>
                    <HiOutlineUserGroup size = '32%' className = "categories-icon"/> <br /> 
                    <span> DIRECTORY </span>
                </div>
                <div className = "categories-box" onClick={() => {navigate("/inquiries")}}>
                    <MdOutlineQuestionAnswer size = '32%' className = "categories-icon"/> <br /> 
                    <span> INQUIRIES </span>
                </div>
                
            </div>
        </div>
    );
}

export default Categories;