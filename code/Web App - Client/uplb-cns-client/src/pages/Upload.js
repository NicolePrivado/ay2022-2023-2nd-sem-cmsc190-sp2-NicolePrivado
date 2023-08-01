import { useState } from 'react';
import {
    Header,
    Footer,
    Menu,
} from '../components/'
import { BsUpload } from 'react-icons/bs'
import { ToastContainer, toast } from 'react-toastify';
import readXlsxFile from 'read-excel-file'
import "../style/upload.css"

const Upload = () => {
    const[files, set_files] = useState([]);

    const check_format = (data) => {
        return(
            data.includes("ACCOUNT NUMBER") &&
            data.includes("AMOUNT") &&
            data.includes("PARTICULAR") &&
            data.includes("DATE CREDIT") &&
            data.includes("REGISTERED NAME")
        )
    }

    const get_files = (e) => {
        // Convert the FileList into an array and iterate
        let selected_files = []
        Array.from(e.target.files).map(file => {
            selected_files.push(file)
        });
        set_files(selected_files)
    } 
    
    const process_files = async() => {
        document.getElementById('upload-button').disabled = true
        document.getElementById('upload-button').innerText = "PROCESSING..."
        let data
        if(files.length > 0){
            for (let index = 0; index < files.length; index++) {
            data = await readXlsxFile(files[index]).then((rows) => {
                return rows;
            })
            if(data[0] && check_format(data[0]))
                if(data.length > 1){
                    await process_data(data, files[index].name)
                } 
                else toast(files[index].name +  ": No data" , {type:'warning', position:'top-center', hideProgressBar: true, closeButton: false})
            else toast(files[index].name +  ": Invalid file" , {type:'warning', position:'top-center', hideProgressBar: true, closeButton: false})
        }
            document.getElementById('upload-button').disabled = false
            document.getElementById('upload-button').innerText = "UPLOAD"
            set_files([])
        }
    }

    const process_data = async (data, fname) => {
        let temp_transaction = {}
        let processed = []
        let col_names = data[0]
        for (let i = 1; i< data.length; i++) {
            temp_transaction = {}
            for (let j = 0; j < col_names.length; j++) {
                temp_transaction[col_names[j].toLowerCase().replace(" ","_")] = data[i][j]
            }
            processed.push(temp_transaction)
        }
        await save_data(processed, fname)
    }

    const save_data = async(data, fname) => {
        for (let index = 0; index < data.length; index++) {
            document.getElementById('upload-button').innerText = "PROCESSING - " + fname + ": " + (index+1).toString() + "/" +data.length.toString()
            await fetch('https://uplb-cns-server.onrender.com/notice/new',{
            method:'POST',
            credentials:'include',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify({
                data: data[index],
            })
            }).then((response) => {return response.json()})
            .then(async(json) => {
                if(json && json.id){
                    await fetch('https://uplb-cns-server.onrender.com/notification/send-push',{
                    method:'POST',
                    credentials:'include',
                    headers:{
                        'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        transaction: data[index],
                        id: json.id
                    })
                    }).then(() => {})
                }
            })
        }
        toast(fname + ": Notices successfully processed!",{type:'success', position:'top-center', hideProgressBar: true, closeButton: false})
    }

    return(
        <div> 
            <p className = 'page-title'> UPLOAD FILE </p>
                <p className = 'upload-note'> Please upload files in .xls or .xlsx format </p>
                <label className = 'upload-interface'>
                    <BsUpload className = 'upload-icon' size = {40}/>
                    <p htmlFor="file-acceptor" className = 'upload-text'>Browse file/s</p>
                    <input type='file' accept={['.xlsx', '.xls']} id='file-acceptor' multiple="multiple" onChange={(e) => {get_files(e)}} onClick = {e => {e.target.value = ""}} />
                    
                </label>
                { files.length > 0? 
                <button id = 'upload-button' onClick = {async() => {await process_files()}}> UPLOAD </button> 
                : <button disabled = {true} id = 'upload-button' > UPLOAD </button> }
                {files.length > 0? 
                <div className = 'filenames'>
                    <p className = 'filenames-title'>Selected files:</p>
                    <br /> <br />
                    {files.map((file,i)=> {
                        return <p key = {i} style = {{marginTop: '0px',marginBottom: '8px'}}>
                            {i+1 + ") " + file.name}
                        </p>
                    })}
                </div>
                : ""}
  
            <Header />
            <Menu />
            <Footer />
            <ToastContainer />
        </div>
    );
}

export default Upload;