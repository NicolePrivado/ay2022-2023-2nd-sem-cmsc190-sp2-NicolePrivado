import { useState, useEffect } from 'react';
import { Header, Footer, Menu } from '../components/'
import { AiFillPlusCircle } from 'react-icons/ai'
import { RxCross2,} from 'react-icons/rx'
import { TiArrowUnsorted } from 'react-icons/ti'
import { FiEdit3, FiSearch } from 'react-icons/fi'
import { TfiTrash } from 'react-icons/tfi'
import { ToastContainer, toast } from 'react-toastify';
import readXlsxFile from 'read-excel-file'
import Dropdown from 'react-dropdown';
import LoadingSpinner from '../components/LoadingSpinner';
import 'react-dropdown/style.css';
import 'react-toastify/dist/ReactToastify.css';
import "../style/directory.css"

const Directory = () => {
    const[show_upload, set_show_upload] = useState(false);
    const[show_edit, set_show_edit] = useState(false);
    const[show_delete, set_show_delete] = useState(false);
    const[page_state, set_page_state] = useState(false);
    const[file, set_file] = useState("");
    const[loading, set_loading] = useState(false);
    const[users, set_users] = useState([]);
    const[key, set_key] = useState("");
    const[reg_value, set_reg_value] = useState("");
    const[id_holder, set_id_holder] = useState("");
    const[data_holder, set_data_holder] = useState({});
    const[name_order, set_name_order] = useState(1);
    const[accno_order, set_accno_order] = useState(1);
    const[email_order, set_email_order] = useState(1);
    const[reg_order, set_reg_order] = useState(1);
    const[note, set_note] = useState('');
    const reg_values = [{value: "", label: "Status"},{value: true, label: "Signed in"}, {value: false, label: "Not signed in"}]
    
    useEffect(()=>{
        // Get all users
        set_users([])
        set_loading(true)
        fetch("https://uplb-cns-server.onrender.com/user?key=" + key 
        + "&order=asc"
        + "&is_reg=" + reg_value.value,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){
                set_users(json.output)
                if(json.output.length > 0)
                    set_note("Loading users...")
                else if(json.output.length === 0) 
                    set_note("No users saved.")
            }
            else set_note("Failed to get users")
            set_loading(false)
        })
        .catch(() => {
            set_note("Failed to get users")
            set_loading(false)
        })
    },[key, page_state, reg_value])

    const handleSorting = (sort_field, sort_order) => {
        if (sort_field) {
          const sorted = [...users].sort((a, b) => {
            if (a[sort_field] === null) return 1;
            if (b[sort_field] === null) return -1;
            if (a[sort_field] === null && b[sort_field] === null) return 0;
            return (
              a[sort_field].toString().localeCompare(b[sort_field].toString(), "en", {
                numeric: true,
              }) * sort_order 
            );
          });
          set_users(sorted);
        }
    };

    const show_upload_prompt = (e) => {
        var file = e.target.files[0]
        set_file(file)
        set_show_upload(true)
    }

    const check_format = (data) => {
        return(
            data.includes("ACCOUNT NUMBER") &&
            data.includes("REGISTERED NAME") &&
            data.includes("MOBILE NUMBER") &&
            data.includes("EMAIL") 
        )
    }

    const add_users = async() => {
        document.getElementById('user-upload-btn').disabled = true
        document.getElementById('user-upload-btn').innerText = "Adding users..."
        let data = await readXlsxFile(file).then((rows) => {
                    return rows;
                })
        if(data[0] && check_format(data[0])){
            if(data.length > 1){
                let temp_user = {}
                let processed = []
                let col_names = data[0]
                for (let i = 1; i< data.length; i++) {
                    temp_user = {}
                    for (let j = 0; j < col_names.length; j++) {
                        temp_user[col_names[j].toLowerCase().replace(" ","_")] = data[i][j]
                    }
                    processed.push(temp_user)
                }
                for (let index = 0; index < processed.length; index++) {
                    await fetch('https://uplb-cns-server.onrender.com/user/new',{
                    method:'POST',
                    credentials:'include',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        data: processed[index],
                    })
                    }).then((response) => {return response.json()})
                }
                toast(file.name + ": Users successfully added!",{type:'success', position:'top-center', hideProgressBar: true, closeButton: false})
                set_page_state(!page_state)
            }
            else toast(file.name + ": No data",{type:'warning', position:'top-center', hideProgressBar: true, closeButton: false})
        }
        else toast(file.name + ": Invalid file",{type:'warning', position:'top-center', hideProgressBar: true, closeButton: false})
        
        document.getElementById('user-upload-btn').disabled = false
        document.getElementById('user-upload-btn').innerText = "Add to directory"
        set_file("")
        set_show_upload(false)
    }

    const edit_user = async(id) => {
        var registered_name = document.getElementById('edit-user-name').value
        var account_number = document.getElementById('edit-user-accnum').value
        var mobile_number = document.getElementById('edit-user-mobilenum').value
        var email = document.getElementById('edit-user-email').value
    
        // Edit usert on database
        await fetch('https://uplb-cns-server.onrender.com/user/edit',{
            method:'PUT',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                id,
                user_data: {
                    registered_name,
                    account_number,
                    mobile_number,
                    email
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

    const delete_user = async(id) => {
        await fetch('https://uplb-cns-server.onrender.com/user/delete?id='+id,{
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

    const UploadPrompt = () => {
        return(
            <div>
                <div className = 'directory-blur' onClick={() => {set_show_upload(false)} }/>
                <div className = 'user-prompt' >
                    
                    <RxCross2 className = 'user-cancel' onClick={() => {set_show_upload(false)}} /> 
                    <p className = 'add-file'>{file.name}</p>
                    <p className = 'add-note'> Note: If an account number already exists, data will be overwritten.</p>

                    <button id = 'user-upload-btn'  onClick={()=>{add_users()}} > Add to directory </button>
                </div>
            </div>
        )
    }

    const DeletePrompt = () => {
        return(
            <div>
                <div className = 'directory-blur' onClick={() => {set_show_delete(false)} }/>
                <div className = 'user-prompt' >
                    <RxCross2 className = 'user-cancel' onClick={() => {set_show_delete(false)}} /> 
                    <p className = 'delete-note'>Please confirm deleting this user</p>
                    <button className = 'user-delete-btn'  onClick={()=>{delete_user(id_holder)}} > Confirm </button>
                </div>
            </div>
        )
    }
    
    const EditPrompt = () => {
        return(
            <div>
                <div className = 'directory-blur' onClick={() => {set_show_edit(false)} }/>
                <div className = 'user-edit-prompt' >
                    <RxCross2 className = 'user-cancel' onClick={() => {set_show_edit(false)}} /> 
                    <b> UPDATE USER INFO</b>
                    <br /> <br />
                    <div className="input-wrapper">
                        <label htmlFor = "Registered Name">Registered Name</label>
                        <input id = 'edit-user-name' type="text" placeholder = 'Enter new name' autoComplete="off" defaultValue = {data_holder.registered_name} />
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor = "Account Number">Account Number</label>
                        <input id = 'edit-user-accnum' type="text" placeholder = 'Enter new account no.' autoComplete="off" defaultValue = {data_holder.account_number} />
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor = "Mobile Number">Mobile Number</label>
                        <input id = 'edit-user-mobilenum' type="text" placeholder = 'Enter new mobile no.' autoComplete="off" defaultValue = {data_holder.mobile_number} />
                    </div>
                    <div className="input-wrapper">
                        <label htmlFor = "Email">Email</label>
                        <input id = 'edit-user-email' type="text" placeholder = 'Enter new email' autoComplete="off" defaultValue = {data_holder.email} />
                    </div>
                    <button className = 'user-edit-btn' onClick={()=>{edit_user(id_holder)}} > UPDATE </button>
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
            {!loading && users.length > 0 ? 
            <table className = 'directory-table' style = {{textAlign: 'center', paddingBottom: '60px'}}>
                <thead>
                    <tr >
                        <th>No.</th>
                        <th>Name <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('registered_name', name_order) ; set_name_order(-1 * name_order)}}/></th>
                        <th>Account No. <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('account_number', accno_order) ; set_accno_order(-1 * accno_order)}}/></th>
                        <th>Mobile No.</th>
                        <th>Email <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('email', email_order) ; set_email_order(-1 * accno_order)}}/></th>
                        <th>Status <TiArrowUnsorted className = 'sort-icon' onClick = {() => {handleSorting('is_registered', reg_order) ; set_reg_order(-1 * accno_order)}}/></th>
                        <th>Actions</th>
                    </tr>
                </thead>
            
                <tbody>
                    {users.map((user, i) => {
                        let row_bg = "#ebebeb";
                        if(i % 2 === 0)
                            row_bg = "white"
                        return <tr key = {i} style = {{backgroundColor : row_bg}}>
                            <td>{i + 1}</td>
                            <td>{user.registered_name}</td>
                            <td>{user.account_number}</td>
                            <td>{user.mobile_number}</td>
                            <td>{user.email}</td>
                            <td>{user.device_token !== ""? "Signed in": "Not signed in"}</td>
                            <td style = {{display:"inline-block"}}>
                                <button className = 'user-actions' onClick = {() => handle_edit(user)}><FiEdit3 size = {15} className = 'user-action-icon'/> <span>Edit</span></button>
                                <button className = 'user-actions' onClick = {() => handle_delete(user.id)}><TfiTrash size = {15} className = 'user-action-icon'/> Delete</button>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
            : loading? <LoadingSpinner />
            :<p className = 'users-empty'> {note} </p>}
            <div className = 'directory-gray-space'></div>
            <p className = 'page-title' style = {{left: '15%'}}> DIRECTORY <span className = 'users-count' > {users.length} </span> </p>
            <div className = 'directory-tool'>
                <label>
                    <AiFillPlusCircle title = "Add users" className = 'add-users-btn' size = {45}/>
                    <input type='file' accept={['.xlsx', '.xls']} id='file-acceptor' onChange={(e) => {show_upload_prompt(e)}} onClick = {e => {e.target.value = ""}} />
                </label>
                <div className = 'user-search'>
                    <input type="text"  placeholder='Enter keyword' onChange={(e) => {set_key(e.target.value)}}/> 
                    <FiSearch size= {18} className = 'users-search-icon'/>
                </div>
                <Dropdown title = "Status" className = 'directory-dropdown' options={reg_values} onChange={e => {set_reg_value(e)}} value={reg_value} placeholder="Registration" />
            </div>
            <Header />
            <Menu />
            <Footer />
            <ToastContainer />
            {show_upload ? <UploadPrompt /> : ""}
            {show_edit ? <EditPrompt /> : ""}
            {show_delete ? <DeletePrompt /> : ""}
        </div>
    );
}
export default Directory;