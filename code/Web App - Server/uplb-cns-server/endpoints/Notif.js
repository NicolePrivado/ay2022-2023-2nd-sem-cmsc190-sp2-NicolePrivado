require('dotenv').config();
const NotifEndpoint = require("express").Router();
var FCM = require('fcm-node');
var fcm = new FCM(process.env.SERVER_KEY);
const fs = require('../firestore');
const db = require('../database')
const { encryptData, decryptData } = require('../encryption');

const verify_token = async(token) => {
    return fs.messaging.send({
        token
    }, true)
}

const get_devices = async () => {
    var data = await db('users')
    .where('device_token', '!=', "")
    .select()
    .then(async(results) => {
        var tokens = []
        const final_tokens = []
        var is_valid
        results.forEach(result => {
            if(!tokens.includes(result.device_token))
                tokens.push(result.device_token)
        });
        for(const token of tokens){
            is_valid = await verify_token(token).then(()=> {return true}).catch(() => {return false})
            if(is_valid) final_tokens.push(token)
        }
        return final_tokens
    });
    return data
}

const get_token = async (acc_num) => {
    return db('users')
    .where('device_token', '!=', "")
    .select()
    .then(async(results) => {
        var token = null
        results.forEach(async(result) => {
            let acc_no = decryptData(result.account_number)
            if(acc_no === acc_num )
                token = result.device_token
        });
        let is_valid_token = await verify_token(token)
            .then(()=> {return true}).catch(() => {return false})
        if(is_valid_token) return token
        else return null
    });
}

const get_token_email = async (email) => {
    return db('users')
    .where('device_token', '!=', "")
    .select()
    .then(async(results) => {
        var token = null
        results.forEach(async(result) => {
            let email1 = decryptData(result.email)
            if(email === email1 )
                token = result.device_token
        });
        let is_valid_token = await verify_token(token)
            .then(()=> {return true}).catch(() => {return false})
        if(is_valid_token) return token
        else return null
    });
}

const send_announcement_notif = async (req, res) => {
    try {
        var error
        var device_tokens = await get_devices()
        const { notif_data } = req.body;
        var message = {
            registration_ids: device_tokens,
            data: {
                title: "UPLB CASHIER ANNOUNCEMENT:" + "\n" + notif_data.title,
                body: encryptData(notif_data.body),
            },
        };
        if(device_tokens.length > 0){
            fcm.send(message, (err, res) => {
                if(err){
                    console.log("There has been an error: ", err)
                    error = err
                }
                else{
                    error = null
                } 
            })
            while(error === undefined){
                await new Promise(r => setTimeout(r, 5000));
            }
            if(error === null)
                return res.json({
                    success: true,
                    message: "Notification successfully sent!",
            });
            else
                return res.status(404).json({ 
                    success: false, 
                    message: "Failed to send notification: "+ error
            });
        }
        else throw('No registered devices')
    } catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to send notification: "+ e
        });
    }
  };

  const send_transaction_notif = async (req, res) => {
    try {
        const { transaction, id } = req.body
        var device_token = await get_token(transaction.account_number.toString())
        var date = new Date(transaction.date_credit)
        if(device_token !== null && device_token !== ""){
            var content = transaction.registered_name 
            + ", " + "Your " 
            + transaction.particular 
            + ": P" + parseFloat(transaction.amount).toFixed(2)
            + " shall be credited to your account on "
            + date.toDateString()
            + ". Thank you!"

            var message = {
                to: device_token,
                data: {
                    title: "UPLB CASHIER NOTICE",
                    body: encryptData(content),
                },
            };
            fcm.send(message, (err, res) => {
                if(err){
                    console.log("There has been an error: ", err)
                } 
            })
            await db('notices')
            .where({ id: id })
            .update({
                status: "Successfully sent",
                timestamp_sent: new Date()
            })
            return res.json({
                success: true,
            });
        }
        else { 
            await db('notices')
            .where({ id: id })
            .update({ status: "Unable to send" })
            .then()
            .catch((e) => {console.log(e)})
            return res.json({
                success: false,
            });
        }
    } catch (e) {
        return res.json({
            success: false,
            error: e
        });
    }
  };

  const send_reply_notif = async (req, res) => {
    
    try {
        const { body, email } = req.body
        var device_token = await get_token_email(email)
        if(device_token !== null){
            var message = {
                to: device_token,
                data: {
                    title: "UPLB CASHIER REPLY TO INQUIRY",
                    body: encryptData(body)
                },
            };
            fcm.send(message, (err, res) => {
                if(err){
                    console.log("There has been an error: ", err)
                } 
            })
            return res.json({
                success: true,
            });
        }
        return res.json({
            success: false,
        });
    } catch (e) {
        return res.json({
            success: false,
        });
    }
};

NotifEndpoint.post("/send", send_announcement_notif);
NotifEndpoint.post("/send-push", send_transaction_notif);
NotifEndpoint.post("/send-reply", send_reply_notif);

module.exports = NotifEndpoint;