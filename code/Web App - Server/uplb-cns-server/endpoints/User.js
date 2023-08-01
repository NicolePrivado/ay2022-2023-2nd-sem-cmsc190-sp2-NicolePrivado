const UserEndpoint = require("express").Router();
const { encryptData, decryptData } = require('../encryption') 
const db = require('../database')
const crypto = require("crypto");

const get_users = async (req, res) => {
    try{
        let { order, key, is_reg} = req.query
        var users = await db('users')
        .orderBy('registered_name', order)
        .select()
        .then(results => {
            var users = []
            results.forEach(result => {
                var data = result
                if(key === "" || (key !== "" && data_contains(key, data))){
                    if(is_reg === 'undefined' || is_reg === '' ||
                        (is_reg && is_reg === 'true' && data.device_token !== "") ||
                        (is_reg && is_reg === 'false' && data.device_token === "")){
                        data.account_number = decryptData(data.account_number.toString())
                        data.mobile_number = decryptData(data.mobile_number.toString())
                        data.email = decryptData(data.email)
                        users.push(data);
                    }    
                }
            });
            return users
        });
        return res.json({ 
            success: true, 
            output: users
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get users"
        });
    }
}

// Search keyword
const data_contains = (key, data) => {
    var acc_num = decryptData(data.account_number.toString())
    var email = decryptData(data.email)
    var mobile_number = decryptData(data.mobile_number.toString())
    return (
        data.registered_name.toLowerCase().includes(key.toLowerCase()) ||
        mobile_number.includes(key.toLowerCase()) ||
        email.toLowerCase().includes(key.toLowerCase()) ||
        acc_num.includes(key.toLowerCase())
    )
}

const get_user = async(req, res) => {
    const { user_details, device_token } = req.body;

    return db('users')
    .select()
    .then(async(querySnapshot) => {
        var user_info = user_details
        var fetched = false
        var id = ""
        querySnapshot.forEach(async(user) => {
            if(user_details.email === decryptData(user.email)) {
                // For saving user info in app's state
                user_info['doc_id'] = user.id
                user_info['account_number'] = decryptData(user.account_number)
                user_info['mobile_number'] = decryptData(user.mobile_number)
                // Return value
                fetched = true
                id = user.id
                return
            }
        })
        // Save device token on database
        if(device_token !== null && device_token !== "") {
            await db('users')
            .where({ id: id })
            .update({device_token: device_token})
            .then(() => {})
            .catch((e) => console.log(e))
        }
        return res.json({ 
            success: true, 
            data: {fetched, user_info}
        });
    })
    .catch((e) => {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get user." + e
        });
    })
}

// Check if user exists
const user_exists = async(acc_no) => {
    return db('users')
    .select()
    .then(results => {
        var id
        results.forEach(result => {
            var acc_num = decryptData(result['account_number'])
            if(acc_no.toString() === acc_num){
                id = result.id
            }
        })
        if(id) return id
        else return false
    })
}

const add_user = async (req, res) => {
    try {
        const { data } = req.body;
        
        var exists = await user_exists(data['account_number'])
         // Add new doc
        if(!exists) {  
            data['id'] = crypto.randomUUID()
            data['account_number'] = encryptData(data['account_number'].toString()) 
            data['mobile_number'] = encryptData(data['mobile_number'].toString())
            data['email'] = encryptData(data['email'].toString())
            data['device_token'] = ""
            await db('users')
            .insert(data)
            .then(() => {})
            .catch(e => {throw(e)})
        }
        // If exists, overwrite doc details
        else{    
            await db('users')
            .where({id: exists})
            .update({
                registered_name: data['registered_name'],
                mobile_number: encryptData(data['mobile_number'].toString()),
                email: encryptData(data['email'].toString())
            })
        }

        return res.json({
            success: true,
        });
    } catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to add user: "+ e
        });
    }
}

const edit_user = async (req, res) => {
    try {
        const { id, user_data } = req.body;
        await db('users')
        .where({ id: id })
        .update({
            registered_name: user_data.registered_name,
            account_number: encryptData(user_data.account_number),
            mobile_number: encryptData(user_data.mobile_number),
            email: encryptData(user_data.email)
        })
        return res.json({
            success: true,
            message: "User successfully updated!"
        });
    } catch (e) {
        return res.status(404).json({ 
            success: false,
            message: "Failed to edit user: " + e
        });
    }
};

const delete_user = async (req, res) => {
    try {
        const { id } = req.query;
        await db('users')
        .where({ id: id })
        .delete()
        return res.json({
            success: true,
            message: "User successfully deleted!"
        });
    } catch (e) {
        return res.status(404).json({ 
            success: false,
            message: "Failed to delete user: " + e
        });
    }
};

const logout = async(req, res) => {
    try{
        const { id } = req.body
        await db('users')
        .where({ id: id })
        .update({ device_token: "" })
        .then()
        .catch(e => {throw(e)})

        return res.json({
            success: true
        })
    }
    catch(e){
        return res.status(404).json({ 
            success: false,
            message: "Failed to logout user: " + e
        });
    }
}

UserEndpoint.get("/", get_users);
UserEndpoint.post("/new", add_user);
UserEndpoint.post("/details", get_user);
UserEndpoint.post("/logout", logout);
UserEndpoint.put("/edit", edit_user);
UserEndpoint.delete("/delete", delete_user);

module.exports = UserEndpoint;