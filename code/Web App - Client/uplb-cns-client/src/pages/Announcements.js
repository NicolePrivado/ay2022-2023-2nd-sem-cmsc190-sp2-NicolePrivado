import { useState, useEffect } from 'react';
import { Header, Footer, Menu } from '../components/'
import { AiFillPlusCircle } from 'react-icons/ai'
import { RxCross2, RxCalendar } from 'react-icons/rx'
import { BiShow, BiHide } from 'react-icons/bi'
import { BsThreeDots, BsFillArrowDownCircleFill, BsFillArrowUpCircleFill } from 'react-icons/bs'
import { FiEdit3, FiSearch } from 'react-icons/fi'
import { TfiTrash } from 'react-icons/tfi'
import { DateRangePicker } from 'react-date-range';
import { ToastContainer, toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner'
import 'react-toastify/dist/ReactToastify.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import "../style/announcements.css"

const disable_button = (id, text) =>{
    document.getElementById(id).disabled = true
    document.getElementById(id).innerText = text
}

const enable_button = (id) => {
    document.getElementById(id).disabled = false
    document.getElementById(id).innerText = "Post"
}

const Announcements = () => {
    const[show_create, set_show_create] = useState(false);
    const[show_edit, set_show_edit] = useState(false);
    const[show_delete, set_show_delete] = useState(false);
    const[show_calendar, set_show_calendar] = useState(false);
    const[is_date_changed, set_date_changed] = useState(false);
    const[options_key, set_options_key] = useState(-1);
    const[ann_holder, set_ann_holder] = useState("");
    const[announcements, set_announcements] = useState([]);
    const[loading, set_loading] = useState(true);
    const[order, set_order] = useState('desc');
    const[key, set_key] = useState('');
    const[note, set_note] = useState('');
    const[page_state, set_page_state] = useState(false);
    const[date_range, set_date_range] = useState({
                                                startDate: new Date(),
                                                endDate: new Date(),
                                                key: 'selection',
                                                });
    
    useEffect(()=>{
        set_announcements([])
        set_loading(true)
        // Get all announcements
        let start, end
        if( is_date_changed )
            start = date_range.startDate.toString()
        else{
            start = new Date('2000-01-01')
            start = start.toString()
        }
            
        end = date_range.endDate.toString()
        
        fetch("http://localhost:3001/announcement?key=" + key + "&order=" + order + "&start=" + start + "&end=" + end,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                set_announcements(json.output)
                if(json.output.length > 0)
                    set_note("")
                else if(json.output.length === 0) 
                    set_note("No announcements created")
            }
            else{
                set_note("Failed to get annoucencements")
            }
            set_loading(false)
        })
        .catch(() => {
            set_note("Failed to get announcements")
            set_loading(false)
        })
    },[page_state,order, date_range, key])

    const post_announcement = async() => {
        var title = document.getElementById('create-anncmt-title').value
        var body = document.getElementById('create-anncmt-content').value
        disable_button('create-anncmt-post-btn', "Creating announcement...")
    
        // Add announcement to database
        fetch('https://uplb-cns-server.onrender.com/announcement/new',{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                announcement_data: {
                    title,
                    body
                },
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false})
             
            document.getElementById('create-anncmt-post-btn').innerText = "Posting announcement..."
        })
    
        // Send push notification regarding new announcement
        fetch('https://uplb-cns-server.onrender.com/notification/send',{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                notif_data: {
                    title,
                    body
                },
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false}) 
            enable_button('create-anncmt-post-btn')
            set_page_state(!page_state)
            set_show_create(!show_create)
        })
    }

    const update_announcement = async(id) => {
        var title = document.getElementById('edit-anncmt-title').value
        var body = document.getElementById('edit-anncmt-content').value
        disable_button('edit-anncmt-update-btn', "Updating announcement...")
    
        // Edit announcement on database
        fetch('https://uplb-cns-server.onrender.com/announcement/edit',{
            method:'PUT',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                id,
                announcement_data: {
                    title,
                    body
                },
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false}) 
            document.getElementById('edit-anncmt-update-btn').innerText = "Update"
            set_page_state(!page_state)
            show_edit_prompt("")
            set_options_key(-1)
        })
        
        // Send push notification regarding edited announcement
        fetch('https://uplb-cns-server.onrender.com/notification/send',{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                notif_data: {
                    title: "[UPDATED] " + title,
                    body
                },
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false}) 
        })
    }

    const hide_announcement = async(id, to_hide) => {
        // Hide or show announcement
        fetch('https://uplb-cns-server.onrender.com/announcement/hide',{
            method:'PUT',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                id,
                to_hide
            })
        }).then((response) => {return response.json()})
        .then(() => { 
            set_page_state(!page_state)
        })
    }

    const delete_announcement = async(id) => {
        // Delete announcement
        fetch('https://uplb-cns-server.onrender.com/announcement/delete?id='+id,{
            method:'DELETE',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
        }).then((response) => {return response.json()})
        .then((json) => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false})
            set_page_state(!page_state)
            show_delete_prompt("")
            set_options_key(-1)
        })
    }

    const change_date = (ranges) => {
        set_date_changed(true);
        set_date_range(ranges.selection)
    }

    const CreatePrompt = () => {
        return(
            <div>
                <div className = 'anncmt-blur' onClick={() => {set_show_create(!show_create)}}/>
                <div className = 'anncmt-prompt' >
                    
                    <RxCross2 className = 'anncmt-cancel' onClick={() => {set_show_create(!show_create)}} /> 
                    <b> Create Announcement </b>
                    <input id = 'create-anncmt-title' type="text" placeholder = 'Title' autoComplete="off"/>
                    <textarea id = 'create-anncmt-content' placeholder = 'Content' />

                    <button id = 'create-anncmt-post-btn'  onClick={()=>{post_announcement()}} > Post </button>
                </div>
            </div>
        )
    }

    const EditPrompt = () => {
        return(
            <div>
                <div className = 'anncmt-blur' onClick={() => {show_edit_prompt("")} }/>
                <div className = 'anncmt-prompt' >
                    <RxCross2 className = 'anncmt-cancel' onClick={() => {show_edit_prompt("")}} /> 
                    <b> Edit Announcement </b>
                    <input id = 'edit-anncmt-title' type="text" placeholder = 'Title' autoComplete="off" defaultValue = {ann_holder.title} />
                    <textarea id = 'edit-anncmt-content' autoComplete="off" placeholder = 'Content' defaultValue = {ann_holder.body}/>
                    <button id = 'edit-anncmt-update-btn'  onClick={()=>{update_announcement(ann_holder.id)}} > Update </button>
                </div>
            </div>
        )
    }

    const DeletePrompt = () => {
        return(
            <div>
                <div className = 'anncmt-blur' onClick={() => {show_delete_prompt("")} }/>
                <div className = 'delete-anncmt-prompt' >
                    
                    <RxCross2 className = 'anncmt-cancel' onClick={() => {show_delete_prompt("")}} /> 
                    <p className = 'delete-anncmt-text'>Please confirm deleting this annnouncement.</p>

                    <button id = 'delete-anncmt-btn'  onClick={()=>{delete_announcement(ann_holder.id)}} > Confirm </button>
                </div>
            </div>
        )
    }

    const Options = (ann) => {
        return(
            <div className = 'announcement-options'>
                <div className = 'announcement-option' onClick={() => {show_edit_prompt(ann)}}> <FiEdit3 className = 'announcement-option-icon' size = {18}/> Edit </div>
                <div className = 'announcement-option' onClick={() => {show_delete_prompt(ann)}}> <TfiTrash className = 'announcement-option-icon' size = {18}/> Delete</div>
            </div>
        )
    }

    const show_options = (i) =>{
        if(options_key === i)
            set_options_key(-1)
        else
            set_options_key(i)
    }

    const show_edit_prompt = (ann) =>{
        set_ann_holder(ann.ann)
        set_show_edit(!show_edit)
    }

    const show_delete_prompt = (ann) =>{
        set_ann_holder(ann.ann)
        set_show_delete(!show_delete)
    }

    const AnnouncementList = () => {
        return(
            <div className = 'announcement-container'>
                {announcements.map((announcement, i)=>{
                    return (
                        <div className = 'announcement-card' key={i}> 
                            {options_key === i? <Options ann = {announcement} />: ""}
                            <div className = 'announcement-actions'>
                                <span> {announcement.hidden? <BiHide className = 'announcement-icons' size = {25} onClick = {()=>{hide_announcement(announcement.id,0)}}/> : <BiShow className = 'announcement-icons' size = {25} onClick = {()=>{hide_announcement(announcement.id,1)}}/> }</span>
                                <span> <BsThreeDots className = 'announcement-icons' size = {25} onClick = {() => {show_options(i)}}/> </span>
                            </div>
                            <p className = 'announcement-title'> {announcement.title} </p>
                            <p className = 'announcement-body'> {announcement.body} </p>
                            <p className = 'announcement-date'> {announcement.datetime} </p>
                        </div>
                    )})
                }
            </div>
        )
    }

    return(
        <div> 
            {!loading && announcements.length !== 0? <AnnouncementList /> 
            : loading ? <LoadingSpinner />
            : <p className = 'announcements-empty'> {note}</p> }
            <div className = 'announcements-gray-space'></div>
            <p className = 'page-title'> ANNOUNCEMENTS <span className = 'anncmt-count'> {announcements.length} </span> </p>
            
            <div className = 'announcements-tool'>
                <AiFillPlusCircle title = "Create announcement" className = 'create-anncmt-btn' size = {45} onClick = {() => {set_show_create(!show_create)}}/>
                
                <div className = 'announcements-search'>
                    <input type="text"  placeholder='Enter keyword' onChange={(e) => {set_key(e.target.value)}}/> 
                    <FiSearch size= {20} className = 'announcements-search-icon'/>
                </div>
                
                <div style = {{width: '40px'}} />
                
                <div className = 'announcements-date-range' onClick={() => {set_show_calendar(!show_calendar)}}>
                    <p className = 'anncmt-display-date'>{ is_date_changed ? date_range.startDate.toDateString().replace(/^\S+\s/,'')+ " - " +  date_range.endDate.toDateString().replace(/^\S+\s/,'') : "--/--/---- – --/--/----"}</p>
                    <RxCalendar  className = 'anncmt-calendar' size = {20} onClick = {() => {set_show_calendar(!show_calendar)}}/>
                </div>
                { order === 'desc' ?
                <BsFillArrowDownCircleFill title = 'Oldest to Latest' className = 'anncmt-tool-icons' size = {30} onClick = {() => {set_order('asc')}}/>
                : <BsFillArrowUpCircleFill title = 'Latest to Oldest' className = 'anncmt-tool-icons' size = {30} onClick = {() => {set_order('desc')}}/>        
                }
            </div>
            <Header />
            <Menu />
            <Footer />
            {show_calendar? <div><div className = 'anncmt-blur' onClick={() => {set_show_calendar(!show_calendar)} }/>
            <DateRangePicker className = 'anncmt-date-range' ranges={[date_range]} onChange={(ranges) => {change_date(ranges)}} /> </div> : ""}
            {show_create? <CreatePrompt /> : ""}
            {show_edit? <EditPrompt /> : ""}
            {show_delete? <DeletePrompt /> : ""}
            <ToastContainer />
        </div>
    );
}

export default Announcements;