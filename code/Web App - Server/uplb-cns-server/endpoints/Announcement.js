const AnnouncementEndpoint = require("express").Router();
const db = require('../database')
const crypto = require("crypto");

// Helper function for date formatting
function padTo2Digits(num) { 
    return num.toString().padStart(2, '0');
  }
// Function for date formatting
function format_date(date) { 
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return (
      [ date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join('-') + ' ' + strTime
    );
}

// Search keyword
const data_contains = (key, data) => {
    return (
        data.title.toLowerCase().includes(key.toLowerCase()) ||
        data.body.toLowerCase().includes(key.toLowerCase())
    )
}

// Get announcements with respect to keyword, order, start date, and end date
const get_announcements = async (req, res) => {
    try{
        let { key, order, start, end } = req.query
        start = new Date(start)
        start.setDate(start.getDate()-1)
        end = new Date(end)
        if(start !== 'Invalid Date'){
            var announcements = await db('announcements')
            .orderBy('timestamp', order)
            .where('timestamp', '>', start)
            .where('timestamp', '<', end)
            .select()
            .then(results => {
                var announcements = []
                results.forEach(result => {
                    if(data_contains(key, result))
                        announcements.push(result);
                });
                return announcements
            })
            .catch(e => {throw e})
        }
        else{
            var announcements = await db('announcements')
            .orderBy('timestamp', order)
            .select()
            .then(results => {
                return results
            })
            .catch(e => {throw e})
        }
        
        return res.json({ 
            success: true, 
            output: announcements
        });
    }catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to get announcements: "+ e
        });
    }
}

const add_announcement = async (req, res) => {
    try {
        const { announcement_data } = req.body;
        var new_announcement = {
            id: crypto.randomUUID(),
            title: announcement_data.title,
            body: announcement_data.body,
            timestamp: new Date(),
            datetime: format_date(new Date()),
            hidden: 0,
        };

        return await db('announcements')
        .insert(new_announcement)
        .then(() => {
            return res.json({
                success: true,
                message: "Announcement successfully created",
            });
        })
        .catch(e => {throw e})

    } catch (e) {
        return res.status(404).json({ 
            success: false, 
            message: "Failed to create announcement "+ e
        });
    }
};

const hide_announcement = async (req, res) => {
    try {
        const { id, to_hide } = req.body;
        return await db('announcements')
        .where({id: id})
        .update({hidden: to_hide})
        .then(() => {
            return res.json({
                success: true,
            });
        })
        .catch(e => {throw e})
    } catch (e) {
        return res.status(404).json({ 
            success: false
        });
    }
};

const edit_announcement = async (req, res) => {
    try {
        const { id, announcement_data } = req.body;

        return await db('announcements')
        .where({id: id})
        .update({
            title: announcement_data.title,
            body: announcement_data.body
        })
        .then(() => {
            return res.json({
                success: true,
                message: "Announcement successfully updated!"
            });
        })
        .catch(e => {throw e})
        
    } catch (e) {
        return res.status(404).json({ 
            success: false,
            message: "Failed to edit announcement! " + e
        });
    }
};

const delete_announcement = async (req, res) => {
    try {
        const { id } = req.query;

        return await db('announcements')
        .where({id: id})
        .delete()
        .then(() => {
            return res.json({
                success: true,
                message: "Announcement successfully deleted!"
            });
        })
        .catch(e => {throw e})
    } catch (e) {
        return res.status(404).json({ 
            success: false,
            message: "Failed to delete announcement! " + e
        });
    }
};

AnnouncementEndpoint.get("/", get_announcements);
AnnouncementEndpoint.post("/new", add_announcement);
AnnouncementEndpoint.put("/hide", hide_announcement);
AnnouncementEndpoint.put("/edit", edit_announcement);
AnnouncementEndpoint.delete("/delete", delete_announcement);

module.exports = AnnouncementEndpoint;