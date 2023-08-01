import { useState, useEffect, useRef } from 'react';
import { Header, Footer, Menu, } from '../components'
import { ImPrinter } from 'react-icons/im'
import { useReactToPrint } from 'react-to-print';
import CanvasJSReact from '@canvasjs/react-charts';
import Dropdown from 'react-dropdown';
import LoadingSpinner from '../components/LoadingSpinner';
import PrintAnalytics from '../components/PrintAnalytics';
import 'react-dropdown/style.css';
import "../style/analytics.css"

const Analytics = () => {
    const[options, set_options] = useState(null);
    const[success_count, set_success_count] = useState([]);
    const[failed_count, set_failed_count] = useState([]);
    const[date_data, set_date_data] = useState([]);
    const[year, set_year] = useState("2023");
    const[filename, set_filename] = useState("");
    const years = ["2022","2023"]

    var CanvasJSChart = CanvasJSReact.CanvasJSChart;

    useEffect(()=>{
        // Get all count notices  
        fetch("https://uplb-cns-server.onrender.com/notice/count-date",
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){ 
                set_date_data(json.output)
            }
        })
        .catch(() => {})
    },) 

    useEffect(()=>{
        // Get all count notices  

        fetch("https://uplb-cns-server.onrender.com/notice/count?year=" + year,
        {
            method: "GET",
            credentials:'include'
        })
        .then(response => {return response.json()})
        .then(json=>{
            if(json.success){ 
                set_success_count(json.output[0])
                set_failed_count(json.output[1])
            }
        })
        .catch(() => {})
    },[year]) 

    useEffect(() => {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        var success_data = []
        var failed_data = []
        var total_data = []
        for (let i = 0; i < success_count.length; i++) {
            if(success_count[i] > 0)
                success_data.push({ y: success_count[i], label: months[i], indexLabel: success_count[i].toString()},)
            if(failed_count[i] > 0)
                failed_data.push({ y: failed_count[i], label: months[i], indexLabel: failed_count[i].toString() },)
            if(success_count[i] + failed_count[i] > 0)
                total_data.push({ y: success_count[i] + failed_count[i], label: months[i], indexLabel: (success_count[i] + failed_count[i]).toString() },)
        }
        for (let i = 0; i < failed_count.length; i++) {
            
        }
        const options = {
            height: 270,
            animationEnabled: true,	
            axisY : {
                title: "Number of Notices"
            },
            toolTip: {
                shared: true
            },
            data: [{
                type: "spline",
                name: "Successfully Sent",
                showInLegend: true,
                dataPoints: success_data
            },
            {
                type: "spline",
                name: "Failed to Send",
                showInLegend: true,
                dataPoints: failed_data
            },
            {
                type: "spline",
                name: "Total Notices Uploaded",
                showInLegend: true,
                dataPoints: total_data
            }]
        }
        if(success_data.length > 0 || failed_data.length > 0)
            set_options(options)

    },[success_count, failed_count])

    const create_filename = () =>{
        set_filename("UPLB Cashier Notification Services - " + new Date().toLocaleString().replaceAll("/", "-"))
    }

    // for printing
    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: filename,
    });

    return(
        <div> 
            <div className = 'analytics-gray-space'></div>
            <p className = 'page-title'> ANALYTICS </p>
            
            <div className='analytics-today'>
                <div className='header1'>
                <p className='day'>TODAY</p>
                <p className='date'>{new Date().toDateString()}</p></div>
                {date_data.length > 0 ? <div><p className='date-data'>{date_data[2]}</p>
                <p className='data-label'>NOTICES UPLOADED</p> </div> : <div className= "analytics-loading"><LoadingSpinner /></div>}
            </div>
            <div className='analytics-thismonth'>
                <div className='header1'>
                <p className='day'>THIS MONTH</p>
                <p className='date'>{new Date().toDateString().split(" ")[1]+" "+new Date().toDateString().split(" ")[3]}</p></div>
                {date_data.length > 0  ? <div><p className='date-data'> {date_data[1]} </p>
                <p className='data-label'>NOTICES UPLOADED</p></div> : <div className= "analytics-loading"><LoadingSpinner /></div>}
            </div>
            <div className='analytics-thisyear'>
                <div className='header1'>
                <p className='day'>THIS YEAR</p>
                <p className='date'>{new Date().toDateString().split(" ")[3]}</p></div>
                {date_data.length > 0  ? <div><p className='date-data'>{date_data[0]}</p>
                <p className='data-label'>NOTICES UPLOADED</p> </div> : <div className= "analytics-loading"><LoadingSpinner /></div>}
            </div>
            <div className='graph'>
                <div className='header2'>
                <p className='graph-title'> NOTICE REPORT FOR YEAR {year}</p></div>
                { options !== null ? <div className='graph-container'><CanvasJSChart options = {options} className = "graph-actual"/></div>
                :<div className= "analytics-loading-graph"><LoadingSpinner /></div>}
            </div>
            <div className = 'analytics-tool'>
                <Dropdown title = "Year" className = 'analytics-dropdown' options={years} onChange={e => {set_year(e.value)}} value={year} placeholder="Year" />   
                <ImPrinter className = 'analytics-tool-icons' style = {{marginLeft: '13px'}} size = {32} onClick={() => {create_filename(); handlePrint();} }/>
            </div>
            <Header />
            <Menu />
            <Footer />
            <div style = {{display:"none"}}><PrintAnalytics options = {options} year = {year} ref = {componentRef}/></div>
        </div>
    );
}

export default Analytics;