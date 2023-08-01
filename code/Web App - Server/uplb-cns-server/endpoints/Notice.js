const NoticeEndpoint = require("express").Router();
const { encryptData, decryptData } = require('../encryption'); 
const db = require('../database')
const crypto = require("crypto");

const get_notices = async (req, res) => {
    try{
        //let { start, end, } = req.query
        let {  start, end, key, particular_val, status, } = req.query
        start = new Date(start)
        end = new Date(end)
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() + 1);

        var notices = await db('notices')
        .orderBy('date_credit', 'desc')
        .where('date_credit', '>', start)
        .where('date_credit', '<', end)
        .select()
        .then(results => {
            var notices = []
            var particulars = []
            var particular = ""
            results.forEach(result => {
                var data = result
                var particular1 = decryptData(data.particular.toString())
                particular = particular1.charAt(0).toUpperCase() + particular1.substring(1).toLowerCase()    // Title Case
                if(!particulars.includes(particular)){
                    particulars.push(particular)
                }
                if(particular_val === "" || (particular_val !== "" && particular1.toLowerCase() === particular_val.toLowerCase())){
                    if(key === "" || (key !== "" && data_contains(key, data))){
                        if(status === "" || (status !== "" && status === data.status)){
                            data.account_number = decryptData(data.account_number.toString())
                            data.amount = decryptData(data.amount.toString())
                            data.particular = decryptData(data.particular.toString())
                            notices.push(data);
                        }
                    }
                }
            });
            particulars = particulars.sort()
            particulars.unshift({value: "", label: "Particular"})
            return [particulars, notices]
        });
        return res.json({ 
            success: true, 
            output: notices
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get notices " + e
        });
    }
}

// Search keyword
const data_contains = (key, data) => {
    var acc_num = decryptData(data.account_number.toString())
    return (
        data.registered_name.toLowerCase().includes(key.toLowerCase()) ||
        acc_num.includes(key.toLowerCase())
    )
}

const get_user_notices = async (req, res) => {
    try{
        let { start, acc_num, } = req.query
        start = new Date(start)
        end = new Date()
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() + 1);

        var notices = await db('notices')
        .orderBy('date_credit', 'desc')
        .where('date_credit', '>', start)
        .where('date_credit', '<', end)
        .select()
        .then(results => {
            var notices = []
            results.forEach(result => {
                var data = result
                var acc_no = decryptData(data.account_number.toString())
                if(acc_no === acc_num){
                    data.account_number = decryptData(data.account_number.toString())
                    data.amount = decryptData(data.amount.toString())
                    data.particular = decryptData(data.particular.toString())
                    notices.push(data);
                }
            });
            return notices
        });
        return res.json({ 
            success: true, 
            output: notices
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get notices! " + e
        });
    }
}


const add_notice = async (req, res) => {
    try {
        const { data } = req.body;
        var data_id = crypto.randomUUID()
        data['id'] = data_id
        data['status'] = "Sending";
        data['timestamp_sent'] = null;
        data['account_number'] = encryptData(data['account_number'].toString())
        data['amount'] = encryptData(parseFloat(data['amount']).toFixed(2))
        data['particular'] = encryptData(data['particular'].toString())
        if(data['date_credit'].toLowerCase() === "today"){
            data['date_credit'] = new Date(new Date().toDateString())
        }
        else data['date_credit'] = new Date(data['date_credit'])

        var id = await db('notices')
        .insert(data)
        .then(() => {
            return data_id;
        })
        .catch(e => console.log(e))

        return res.json({
            success: true,
            message: "Notice successfully added",
            id
        });
        
    } catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to add notice "+ e
        });
    }
}

const edit_notice = async (req, res) => {
    try {
        const { id, notice_data } = req.body;
        await db('notices')
        .where({ id: id })
        .update({
            amount: encryptData(notice_data.amount.toString()),
            particular: encryptData(notice_data.particular),
            date_credit: new Date(notice_data.date_credit),
        })
        .then()
        .catch(e => console.log(e))
        return res.json({
            success: true,
            message: "Notice successfully updated!"
        });
    } catch (e) {
        return res.status(404).json({ 
            success: false,
            message: "Failed to edit notice: " + e
        });
    }
};

const delete_notice = async (req, res) => {
    try {
        const { id } = req.query;
        await db('notices')
        .where({ id: id })
        .delete()

        return res.json({
            success: true,
            message: "Notice successfully deleted!"
        });
        
    } catch (e) {
        return res.status(404).json({ 
            success: false,
            message: "Failed to delete notice: " + e
        });
    }
};

const get_count = async (req, res) => {
    try{
        let { year } = req.query
        start = new Date(`${parseInt(year)-1}-12-31`)
        end = new Date(`${year}-12-31`)
        var output = await db('notices')
        .where('date_credit', '>', start)
        .where('date_credit', '<', end)
        .select()
        .then(results => {
            var success_data = [0,0,0,0,0,0,0,0,0,0,0,0]
            var failed_data = [0,0,0,0,0,0,0,0,0,0,0,0]
            results.forEach(result => {
                var data = result
                var monthIndex = new Date(data.date_credit).getMonth()
                if(data.status === "Successfully sent")
                    success_data[monthIndex]++
                else failed_data[monthIndex]++
            });
            return [success_data, failed_data]
        });
        return res.json({ 
            success: true, 
            output: output
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get notices"
        });
    }
}

const get_count_date = async (req, res) => {
    try{
        var year = new Date().getFullYear()
        var start = new Date(`${year-1}-12-31`)
        var end = new Date(`${year}-12-31`)

        var month = new Date().getMonth()
        var day = new Date().getDate()

        var count = await db('notices')
        .orderBy('date_credit', 'desc')
        .where('date_credit', '>', start)
        .where('date_credit', '<', end)
        .select()
        .then(results => {
            var count = [results.length,0,0]
            results.forEach(result => {
                var data = result
                var monthIndex = new Date(data.date_credit).getMonth()
                var dayIndex = new Date(data.date_credit).getDate()
                if(monthIndex === month){
                    count[1]++
                    if(dayIndex.toString() === day.toString()){
                        count[2]++
                    }
                }
            });
            return count
        });
        return res.json({ 
            success: true, 
            output: count
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get notices"
        });
    }
}

NoticeEndpoint.get("/", get_notices);
NoticeEndpoint.post("/new", add_notice);
NoticeEndpoint.put("/edit", edit_notice);
NoticeEndpoint.delete("/delete", delete_notice);
NoticeEndpoint.get("/count-date", get_count_date);
NoticeEndpoint.get("/count", get_count);
NoticeEndpoint.get("/user", get_user_notices);

module.exports = NoticeEndpoint;