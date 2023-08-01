const ReplyEndpoint = require("express").Router();
const db = require('../database')
const crypto = require("crypto");

const get_replies = async (req, res) => {
    try{
        let { id } = req.query

        var replies = await db('replies')
        .orderBy('timestamp', "asc")
        .where('inquiry_id', '=', id)
        .select()
        .then(results => { return results });
        return res.json({ 
            success: true, 
            output: replies
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get replies! " + e
        });
    }
}

const add_reply = async (req, res) => {
    try {
        const { reply } = req.body;
        reply.id = crypto.randomUUID()
        reply.timestamp = new Date()

        await db('replies')
        .insert(reply)
        .then()
        .catch((e) => {throw e})

        return res.json({
            success: true,
            message: "Reply successfully created",
        });
        
    } catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to create reply "+ e
        });
    }
};

ReplyEndpoint.get("/", get_replies);
ReplyEndpoint.post("/", add_reply);

module.exports = ReplyEndpoint;