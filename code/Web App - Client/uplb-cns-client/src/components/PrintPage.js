import React from "react";
import '../style/print-page.css'

const PrintPage = React.forwardRef((props, ref) => {
    return(
        <div ref = {ref} className='transactions-page'>
            <p className = "transactions-title">UPLB CASHIER NOTICES</p>
            {props.data !== undefined ? 
                <table className = 'transactions-table' style = {{textAlign: 'center', paddingBottom: '60px'}}>
                <thead>
                    <tr >
                        <th className = "print-th">No.</th>
                        <th className = "print-th">Account No.</th>
                        <th className = "print-th">Name</th>
                        <th className = "print-th">Amount</th>
                        <th className = "print-th">Particular</th>
                        <th className = "print-th">Date Credited</th>
                        <th className = "print-th">Status</th>
                        <th className = "print-th">Sent on</th>
                    </tr>
                </thead>
                <tbody>
                    {props.data.map((data, i) => {
                        let date_credit = new Date(data.date_credit)
                        let sent = data.timestamp_sent ? new Date(data.timestamp_sent).toLocaleString() : "----"
                        let row_bg = "#ebebeb";
                        if(i % 2 === 0) row_bg = "white"
                        return <tr key = {i} style = {{backgroundColor : row_bg}}>
                            <td className = "print-td">{i + 1}</td>
                            <td className = "print-td">{data.account_number}</td>
                            <td className = "print-td">{data.registered_name}</td>
                            <td className = "print-td">{data.amount}</td>
                            <td className = "print-td">{data.particular}</td>
                            <td className = "print-td">{date_credit.toDateString()}</td>
                            <td className = "print-td">{data.status}</td>
                            <td className = "print-td">{sent}</td>
                        </tr>
                    })} 
                    
                </tbody>
            </table>
            : <div>No notices recorded</div>}
        </div>
    )
})
export default PrintPage;