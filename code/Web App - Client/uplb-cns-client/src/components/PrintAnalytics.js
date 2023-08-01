import React from "react";
import CanvasJSReact from '@canvasjs/react-charts';
import '../style/print-analytics.css'
import '../style/analytics.css'

const PrintAnalytics = React.forwardRef((props, ref) => {
    var CanvasJSChart = CanvasJSReact.CanvasJSChart;
    return(
        <div ref = {ref} className='analytics-page'>
            <p className = "analytics-title">UPLB CASHIER NOTIFICATION SERVICES ANALYTICS</p>
            <div className='graph' style={{width: '90%', left: '5%', top: '100px', }}>
                <div className='header2' style={{width: '100%'}}>
                <p className='graph-title'> NOTICE REPORT FOR YEAR {props.year}</p></div>
                {props.options !== null ? <div className='graph-container'><CanvasJSChart options = {props.options} className = "graph-actual"/></div> : ""}
            </div>
            
        </div>

    )
})
export default PrintAnalytics;