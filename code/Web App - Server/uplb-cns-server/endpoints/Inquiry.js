const InquiryEndpoint = require("express").Router();
const db = require('../database')
const crypto = require("crypto");

// Search keyword
const data_contains = (key, data) => {
    return (
        data.content.toLowerCase().includes(key.toLowerCase()) ||
        data.name.toLowerCase().includes(key.toLowerCase())
    )
}

const get_inquiries = async (req, res) => {
    try{
        let { key, order, start, end } = req.query
        start = new Date(start)
        end = new Date(end)
        var inquiries = await db('inquiries')
        .orderBy('timestamp', order)
        .where('timestamp', '>', start)
        .where('timestamp', '<', end)
        .select()
        .then(async results => {
            var inquiries = []
            results.forEach(result => {
                if(data_contains(key, result))
                    inquiries.push(result);
            });
            for(const inq of inquiries){
                var reply = await db('replies')
                .where('inquiry_id', '=', inq.id)
                .count('*')
                .then((res)=> {return res[0]})
                inq.reply_count = reply['count(*)']
            }
            return inquiries
        })
        .catch(e => {throw e})
        return res.json({ 
            success: true, 
            output: inquiries
        });
    }catch (e) {
        console.log(e)
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get inquiries! " + e
        });
    }
}

const get_own_inquiries = async (req, res) => {
    try{
        let { user_id } = req.query

        var inquiries = await db('inquiries')
        .orderBy('timestamp', 'desc')
        .where('user_id', '=', user_id)
        .select()
        .then(async results => {
            for(const inq of results){
                var reply = await db('replies')
                .where('inquiry_id', '=', inq.id)
                .count('*')
                .then((res)=> {return res[0]})
                inq.reply_count = reply['count(*)']
            }
            return results
        })
        .catch((e) => {throw e})
        return res.json({ 
            success: true, 
            output: inquiries
        });
    }catch (e) {
        console.log(e)
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get inquiries! " + e
        });
    }
}

const get_inquiry = async (req, res) => {
    try{
        let { id } = req.query

        var inquiries = await db('inquiries')
        .orderBy('timestamp', 'desc')
        .where('id', '=', id)
        .select()
        .then(async results => {
            for(const inq of results){
                var reply = await db('replies')
                .where('inquiry_id', '=', inq.id)
                .count('*')
                .then((res)=> {return res[0]})
                inq.reply_count = reply['count(*)']
            }
            return results
        })
        .catch((e) => {throw e})
        return res.json({ 
            success: true, 
            output: inquiries[0]
        });
    }catch (e) {
        console.log(e)
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get inquiries! " + e
        });
    }
}

const add_inquiry = async (req, res) => {
    try{
        let { inquiry } = req.body
        inquiry.id = crypto.randomUUID()
        inquiry.timestamp = new Date()

        await db('inquiries')
        .insert(inquiry)
        .then(() => {})
        .catch((e) => {throw(e)})
            
        return res.json({ 
            success: true, 
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to add inquiry! " + e
        });
    }
}

InquiryEndpoint.get("/", get_inquiries);
InquiryEndpoint.post("/", add_inquiry);
InquiryEndpoint.get("/one", get_inquiry);
InquiryEndpoint.get("/own", get_own_inquiries);

module.exports = InquiryEndpoint;