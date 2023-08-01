import React, { useState, useEffect } from 'react';
import { Header, Footer, Menu } from '../components/'
import { RxCross2, RxCalendar } from 'react-icons/rx'
import { BsFillArrowDownCircleFill, BsFillArrowUpCircleFill } from 'react-icons/bs'
import { FiSearch } from 'react-icons/fi'
import { IoMdSend } from 'react-icons/io'
import { DateRangePicker } from 'react-date-range';
import { ToastContainer, toast } from 'react-toastify';
import { MdAccountCircle } from 'react-icons/md';
import LoadingSpinner from '../components/LoadingSpinner'
import 'react-toastify/dist/ReactToastify.css';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import "../style/inquiries.css"

const Inquiries = () => {
    const[show_inq, set_show_inq] = useState(false);
    const[show_calendar, set_show_calendar] = useState(false);
    const[is_date_changed, set_date_changed] = useState(false);
    const[inq_holder, set_inq_holder] = useState("");
    const[inquiries, set_inquiries] = useState([]);
    const[replies, set_replies] = useState([]);
    const[loading, set_loading] = useState(true);
    const[order, set_order] = useState('desc');
    const[key, set_key] = useState('');
    const[note, set_note] = useState('');
    const[reply_note, set_reply_note] = useState('');
    const[page_state, set_page_state] = useState(false);
    const[date_range, set_date_range] = useState({
                                                startDate: new Date(),
                                                endDate: new Date(),
                                                key: 'selection',
                                                });
    
    useEffect(()=>{
        set_inquiries([])
        set_loading(true)
        // Get all inquiries
        let start, end
        if( is_date_changed )
            start = date_range.startDate.toString()
        else{
            start = new Date('2000-01-01')
            start = start.toString()
        }
            
        end = date_range.endDate.toString()
        
        fetch("https://uplb-cns-server.onrender.com/inquiry?key=" + key + "&order=" + order + "&start=" + start + "&end=" + end,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                set_inquiries(json.output)
                if(json.output.length > 0)
                    set_note("")
                else if(json.output.length === 0) 
                    set_note("No inquiries yet")
            }
            else{
                set_note("Failed to get inquiries")
            }
            set_loading(false)
        })
        .catch((e) => {
            set_note("Failed to get inquiries")
            set_loading(false)
        })
        
    },[page_state,order, date_range, key])

    const get_replies = (id) => {
        set_replies([])
        fetch("https://uplb-cns-server.onrender.com/reply?id=" + id,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                set_replies(json.output)
                if(json.output.length > 0)
                    set_reply_note("")
                else if(json.output.length === 0) 
                    set_reply_note("No replies yet")
                set_loading(false)
            }
        })
        .catch(() => {
            set_reply_note("Failed to get replies")
            set_loading(false)
        })
    }

    const add_reply = () => {
        var body = document.getElementById('view-inquiry-reply').value
        console.log(inq_holder.id)
    
        // Add reply to database
        fetch('https://uplb-cns-server.onrender.com/reply',{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                reply: {
                    body,
                    name: "Cashier's Office",
                    inquiry_id: inq_holder.id
                },
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false})
        })
        .catch(e => {console.log(e.toString())})
    
        // Send push notification regarding reply
        fetch('https://uplb-cns-server.onrender.com/notification/send-reply',{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                email: inq_holder.email,
                body
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false}) 
            set_page_state(!page_state)
            get_replies(inq_holder.id)
        })
    }

    const change_date = (ranges) => {
        set_date_changed(true);
        set_date_range(ranges.selection)
    }

    const showInquiry = (inquiry) => {
        set_inq_holder(inquiry)
        set_show_inq(true)
        get_replies(inquiry.id)
    }

    const InquiryView = () => {
        const inquiry = inq_holder
        return(
            <div>
                <div className = 'inquiry-blur' onClick={() => {set_show_inq(false)} }/>
                <div className = 'inquiry-prompt' >
                    <RxCross2 className = 'anncmt-cancel' onClick={() => {set_show_inq(false)}} /> 
                    <div className = 'view-inquiry-card' > 
                            <div className = 'view-inquiry-title'> 
                                <MdAccountCircle size= {40} className='inquiry-icon'/>
                                <span className = 'view-inquiry-title-text'> {inquiry.name}</span>   
                            </div>
                            <span className = 'view-inquiry-email'> {inquiry.email} </span>
                            <p className = 'view-inquiry-body'> {inquiry.content} </p>
                            <p className = 'view-inquiry-date'> {new Date(inquiry.timestamp).toLocaleString()} </p>
                        </div>
                    <textarea id = 'view-inquiry-reply' autoComplete="off" placeholder = 'Write a reply'/>
                    <button id = 'reply-btn'  onClick={()=>{add_reply()}} > <IoMdSend className = 'reply-icon'/>Reply </button>
                    <p className = 'replies-header'>Replies</p>
                    {replies.length > 0? <ReplyList />
                    : <p className='empty-reply'>{reply_note}</p> }
                </div>
            </div>
        )
    }

    const ReplyList = () => {
        return(
            <div className='reply-list'>
                {replies.map((reply, i)=>{
                    if(reply.name === "Cashier's Office"){
                        return (
                            <div className = 'reply-card1' key={i} > 
                                <div className = 'reply-title'> 
                                    <span className = 'reply-title-text'> {reply.name}</span>   
                                </div>
                                <p className = 'reply-body'> {reply.body} </p>
                                <p className = 'reply-date'>{new Date(reply.timestamp).toLocaleString()} </p>
                            </div>
                        )
                    }
                    else{
                        return (
                            <div className = 'reply-card2' key={i} > 
                                <div className = 'reply-title'> 
                                    <span className = 'reply-title-text'> {reply.name}</span>   
                                </div>
                                <p className = 'reply-body'> {reply.body} </p>
                                <p className = 'reply-date'>{new Date(reply.timestamp).toLocaleString()} </p>
                            </div>
                        )
                    }
                    
                })}
            </div>
        )
    }

    const InquiryList = () => {
        return(
            <div className = 'inquiry-container'>
                {inquiries.map((inquiry, i)=>{
                    return (
                        <div className = 'inquiry-card' key={i} onClick = {() => showInquiry(inquiry)}> 
                            <div className = 'inquiry-title'> 
                                <MdAccountCircle size= {40} className='inquiry-icon'/>
                                <span className = 'inquiry-title-text'> {inquiry.name}</span>   
                            </div>
                            <span className = 'inquiry-email'> {inquiry.email} </span>
                            <p className = 'inquiry-body'> {inquiry.content} </p>
                            <p className = 'inquiry-date'> <span>{inquiry.reply_count} Replies, </span> {new Date(inquiry.timestamp).toLocaleString()} </p>
                        </div>
                    )})
                }
            </div>
        )
    }

    return(
        <div> 
            {!loading && inquiries.length !== 0? <InquiryList /> 
            : loading? <LoadingSpinner />
            :<p className = 'inquiries-empty'> {note}</p> }
            <div className = 'inquiries-gray-space'></div>
            <p className = 'page-title'> INQUIRIES <span className = 'inquiry-count'> {inquiries.length} </span> </p>
            
            <div className = 'inquiries-tool'>
                <div className = 'inquiries-search'>
                    <input type="text"  placeholder='Enter keyword' onChange={(e) => {set_key(e.target.value)}}/> 
                    <FiSearch size= {20} className = 'inquiries-search-icon'/>
                </div>
                <div style = {{width: '40px'}} />
                <div className = 'inquiries-date-range' onClick={() => {set_show_calendar(!show_calendar)}}>
                    <p className = 'inquiry-display-date'>{ is_date_changed ? date_range.startDate.toDateString().replace(/^\S+\s/,'')+ " - " +  date_range.endDate.toDateString().replace(/^\S+\s/,'') : "--/--/---- – --/--/----"}</p>
                    <RxCalendar  className = 'inquiry-calendar' size = {20} onClick = {() => {set_show_calendar(!show_calendar)}}/>
                </div>
                { order === 'desc' ?
                <BsFillArrowDownCircleFill title = 'Oldest to Latest' className = 'inquiry-tool-icons' size = {30} onClick = {() => {set_order('asc')}}/>
                : <BsFillArrowUpCircleFill title = 'Latest to Oldest' className = 'inquiry-tool-icons' size = {30} onClick = {() => {set_order('desc')}}/>        
                }
            </div>
            <Header />
            <Menu />
            <Footer />
            {show_calendar? <div><div className = 'inquiry-blur' onClick={() => {set_show_calendar(!show_calendar)} }/>
            <DateRangePicker className = 'inquiry-date-range' ranges={[date_range]} onChange={(ranges) => {change_date(ranges)}} /> </div> : ""}
            <ToastContainer />
            {show_inq? <InquiryView />: ""}
        </div>
    );
}

export default Inquiries;