import { useState, useEffect, useRef } from 'react';
import { Header, Footer, Menu, PrintPage } from '../components'
import { FiEdit3, FiSearch } from 'react-icons/fi'
import { TfiTrash } from 'react-icons/tfi'
import { TiArrowUnsorted } from 'react-icons/ti'
import { RxCalendar, RxCross2 } from 'react-icons/rx'
import { ImPrinter } from 'react-icons/im'
import { DateRangePicker } from 'react-date-range';
import { useReactToPrint } from 'react-to-print';
import { ToastContainer, toast } from 'react-toastify';
import { BsArrowLeftCircle, BsArrowRightCircle } from 'react-icons/bs';
import Dropdown from 'react-dropdown';
import LoadingSpinner from '../components/LoadingSpinner';
import 'react-dropdown/style.css';
import "../style/notices.css"

const Notices = () => {
    const[show_calendar, set_show_calendar] = useState(false);
    const[show_edit, set_show_edit] = useState(false);
    const[show_delete, set_show_delete] = useState(false);
    const[page_state, set_page_state] = useState(false);
    const[page_num, set_page_num] = useState(1);
    const[pages, set_pages] = useState(0);
    const[is_date_changed, set_date_changed] = useState(false);
    const[loading, set_loading] = useState(true);
    const[orig_notices, set_orig_notices] = useState([]);
    const[notices, set_notices] = useState([]);
    const[particular, set_particular] = useState("");
    const[particulars, set_particulars] = useState([]);
    const[status, set_status] = useState("");
    const[key, set_key] = useState("");
    const[note, set_note] = useState('');
    const[date_range, set_date_range] = useState({startDate: new Date(), endDate: new Date(), key: 'selection'});
    const[filename, set_filename] = useState("");
    const[id_holder, set_id_holder] = useState("");
    const[data_holder, set_data_holder] = useState({});
    const[name_order, set_name_order] = useState(1);
    const[accno_order, set_accno_order] = useState(1);
    const[amount_order, set_amount_order] = useState(1);
    const[date_order, set_date_order] = useState(1);
    const[particular_order, set_particular_order] = useState(1);
    const[status_order, set_status_order] = useState(1);
    const statuses = [{value: "", label: "Status"},{value: "Successfully sent", label: "Successfully sent"}, {value: "Unable to send", label: "Unable to send"}]

    useEffect(()=>{
        set_notices([])
        set_loading(true)
        // Get all notices
        let start, end
        if( is_date_changed )
            start = date_range.startDate.toString()
        else{
            start = new Date('2000-01-01')
            start = start.toString()
        }

        end = date_range.endDate.toString()
        
        fetch("https://uplb-cns-server.onrender.com/notice?key=" + key 
        + "&start=" + start 
        + "&end=" + end
        + "&particular_val=" + particular
        + "&status=" + status,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                set_particulars(json.output[0])
                set_orig_notices(json.output[1])
                set_notices(json.output[1].slice((page_num-1)*100, page_num * 100))
                set_pages(Math.ceil(json.output[1].length/100))
                if(json.output[1].length > 0)
                    set_note("")
                else if(json.output[1].length === 0) 
                    set_note("No notices recorded")
            }
            else{
                set_note(json.message)
            }
            set_loading(false)
        })
        .catch((e) => {
            set_note("Failed to get noticess.", e.toString())
            set_loading(false)
        })
    },[page_state, date_range, key, is_date_changed, particular, status]) 

    useEffect(() => {
        set_notices(orig_notices.slice((page_num-1)*100, page_num * 100))
    },[page_num])
    
    const handleSorting = (sort_field, sort_order) => {
        if (sort_field) {
          const sorted = [...notices].sort((a, b) => {
            if (a[sort_field] === null) return 1;
            if (b[sort_field] === null) return -1;
            if (a[sort_field] === null && b[sort_field] === null) return 0;
            if (sort_field === "date_credit"){
                return (
                    new Date(a[sort_field]._seconds *1000) - new Date(b[sort_field]._seconds *1000) * sort_order
                );
            }
            return (
              a[sort_field].toString().localeCompare(b[sort_field].toString(), "en", {
                numeric: true,
              }) * sort_order 
            );
          });
          set_notices(sorted);
        }
    };

    const change_date = (ranges) => {
        set_date_changed(true);
        set_date_range(ranges.selection)
    }

    const create_filename = () =>{
        set_filename("UPLB Cashier Notification Services - " + new Date().toLocaleString().replaceAll("/", "-"))
    }

    // for printing
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: filename,
    });

    const edit_notice = async(id) => {
        var amount = document.getElementById('edit-notice-amount').value
        var particular = document.getElementById('edit-notice-particular').value
        var date_credit = document.getElementById('edit-notice-date').value
        
        // Edit notice on database
        await fetch('https://uplb-cns-server.onrender.com/notice/edit',{
            method:'PUT',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                id,
                notice_data: {
                    amount,
                    particular,
                    date_credit,
                },
            })
        }).then((response) => {return response.json()})
        .then(json => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false}) 
            set_page_state(!page_state)
            set_show_edit(false)
        })
    }

    const delete_notice = async(id) => {
        await fetch('https://uplb-cns-server.onrender.com/notice/delete?id='+id,{
            method:'DELETE',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
        }).then((response) => {return response.json()})
        .then((json) => { 
            if(json.success) toast(json.message, {type:'success', position:'top-center', hideProgressBar: true, closeButton: false}) 
            else toast(json.message, {type:'error', position:'top-center', hideProgressBar: true, closeButton: false})
            
        })
        set_show_delete(false)
        set_page_state(!page_state)
    }

    const DeletePrompt = () => {
        return(
            <div>
                <div className = 'directory-blur' onClick={() => {set_show_delete(false)} }/>
                <div className = 'user-prompt' >
                    
                    <RxCross2 className = 'user-cancel' onClick={() => {set_show_delete(false)}} /> 
                    <p className = 'delete-note'>Please confirm deleting this notice</p>

                    <button className = 'user-delete-btn'  onClick={()=>{delete_notice(id_holder)}} > Confirm </button>
                </div>
            </div>
        )
    }

    const EditPrompt = () => {
        var date = new Date(data_holder.date_credit)
        return(
            <div>
                <div className = 'directory-blur' onClick={() => {set_show_edit(false)} }/>
                <div className = 'user-edit-prompt' style = {{height: '330px'}}>
                    <RxCross2 className = 'user-cancel' onClick={() => {set_show_edit(false)}} /> 
                    <b> UPDATE NOTICE DETAILS</b>
                    <br /> <br />
                    <div className ="input-wrapper">
                        <label htmlFor = "Amount">Amount</label>
                        <input id = 'edit-notice-amount' type="text" placeholder = 'Enter new amount' autoComplete="off" defaultValue = {data_holder.amount} />
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor = "Particular">Particular</label>
                        <input id = 'edit-notice-particular' type="text" placeholder = 'Enter new particular' autoComplete="off" defaultValue = {data_holder.particular} />
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor = "Date Credit">Date Credit</label>
                        <input id = 'edit-notice-date' type="text" placeholder = 'MM/DD/YYYY' autoComplete="off" defaultValue = {date.toDateString()} />
                    </div>
                    
                    <button className = 'user-edit-btn' onClick={()=>{edit_notice(id_holder)}} > UPDATE </button>
                </div>
            </div>
        )
    }

    const handle_delete = (id) => {
        set_id_holder(id)
        set_show_delete(true)
    }

    const handle_edit = (user) => {
        set_id_holder(user.id)
        set_data_holder(user)
        set_show_edit(true)
    }

    return(
        <div> 
            {!loading && notices.length > 0 ? 
            <table className = 'notice-table' style = {{textAlign: 'center', paddingBottom: '60px'}}>
                <thead>
                    <tr >
                        <th>No.</th>
                        <th>Account No. <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('account_number', accno_order) ; set_accno_order(-1 * accno_order)}}/></th>
                        <th>Name <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('registered_name',name_order) ; set_name_order(-1 * name_order)}}/> </th>
                        <th>Amount <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('amount',amount_order) ; set_amount_order(-1 * amount_order)}}/></th>
                        <th>Particular <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('particular',particular_order) ; set_particular_order(-1 * particular_order)}}/></th>
                        <th>Date Credited <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('date_credit',date_order) ; set_date_order(-1 * date_order)}}/></th>
                        <th>Status <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('status',status_order) ; set_status_order(-1 * status_order)}}/></th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {notices.map((notice, i) => {
                            let date_credit = new Date(notice.date_credit)
                            let row_bg = "#ebebeb";
                            let title = notice.status === "Unable to send" ? "Account not signed in." : 
                                        notice.status === "Successfully sent" ? "Sent on " + new Date(notice.timestamp_sent).toLocaleString() : ""
                            if(i % 2 === 0) row_bg = "white"
                            return <tr key = {i} style = {{backgroundColor : row_bg}}>
                                <td>{(i + 1) + ((page_num-1)*100)}</td>
                                <td>{notice.account_number}</td>
                                <td>{notice.registered_name}</td>
                                <td>{notice.amount}</td>
                                <td>{notice.particular}</td>
                                <td>{date_credit.toDateString()}</td>
                                <td title = {title} style = {{cursor: 'context-menu'}}>{notice.status}</td>
                                <td style = {{display:"inline-block"}}>
                                    <button className = 'notice-actions' onClick = {() => handle_edit(notice)}><FiEdit3 size = {15} className = 'notice-action-icon'/> <span>Edit</span></button>
                                    <button className = 'notice-actions' onClick = {() => handle_delete(notice.id)}><TfiTrash size = {15} className = 'notice-action-icon'/> Delete</button>
                                </td>
                            </tr>
                        })
                    }
                </tbody>
                <br />
            </table>
            : loading ? <LoadingSpinner />
            : <p className = 'notices-empty'> {note} </p>}
            <div className = 'notices-gray-space'></div>
            <p className = 'page-title' style = {{left: '15%'}}> NOTICES <span className = 'notices-count'> {orig_notices.length} </span> </p>
            <div className = 'notices-tool'>
                <div className = 'notices-search'>
                    <input type="text"  placeholder='Search by name or account number' onChange={(e) => {set_key(e.target.value)}}/> 
                    <FiSearch size= {18} className = 'notices-search-icon'/>
                </div>
                <Dropdown title = "Particular" className = 'notice-dropdown' options={particulars} onChange={e => {set_particular(e.value)}} value={particular} placeholder="Particular" />
                <Dropdown title = "Status" className = 'notice-dropdown2' options={statuses} onChange={e => {set_status(e.value)}} value={status} placeholder="Status" />
                <div className = 'notices-date-range' onClick={() => {set_show_calendar(!show_calendar)}}>
                    <p className = 'notice-display-date'>{ is_date_changed ? date_range.startDate.toDateString().replace(/^\S+\s/,'')+ " - " +  date_range.endDate.toDateString().replace(/^\S+\s/,'') : "--/--/---- – --/--/----"}</p>
                    <RxCalendar  className = 'notice-calendar' size = {20} onClick = {() => {set_show_calendar(!show_calendar)}}/>
                </div>
                <ImPrinter className = 'notice-tool-icons' style = {{marginLeft: '13px'}} size = {32} onClick={() => {create_filename(); handlePrint();} }/>
            </div>
            {!loading ?
            <p className='notices-pagenum'> 
                <BsArrowLeftCircle size={22} className='page-icon' onClick={() => {
                    if(page_num !== 1) set_page_num(page_num-1)
                }}/> 
                Page <b>{page_num}</b> of <b>{pages} </b>
                <BsArrowRightCircle size={22}className='page-icon' onClick={() => {
                    if(page_num !== pages) set_page_num(page_num+1)
                }}/>
            </p> 
            : ""}
            {show_calendar? <div><div className = 'anncmt-blur' onClick={() => {set_show_calendar(!show_calendar)} }/>
            <DateRangePicker className = 'notice-date-range' ranges={[date_range]} onChange={(ranges) => {change_date(ranges)}} /> </div> : ""}
            <Header />
            <Menu />
            <Footer />
            <ToastContainer />
            {show_edit ? <EditPrompt /> : ""}
            {show_delete ? <DeletePrompt /> : ""}
            
            <div style = {{display:"none"}}><PrintPage data = {notices} ref = {componentRef}/></div> 
        </div>
    );
}

export default Notices;