/* Import endpoints */
const AnnouncementEndpoint = require('./endpoints/Announcement');
const NotifEndpoint = require('./endpoints/Notif');
const NoticeEndpoint = require('./endpoints/Notice');
const UserEndpoint = require('./endpoints/User');
const InquiryEndpoint = require('./endpoints/Inquiry');
const ReplyEndpoint = require('./endpoints/Reply');
const AuthEndpoint = require('./endpoints/Auth');

// Create router object
const router = require('express').Router();

/* Base Routes */
router.use('/notification', NotifEndpoint);
router.use('/announcement', AnnouncementEndpoint);
router.use('/notice', NoticeEndpoint);
router.use('/user', UserEndpoint);
router.use('/inquiry', InquiryEndpoint);
router.use('/reply', ReplyEndpoint);
router.use('/auth', AuthEndpoint);


/* Export Router */
module.exports = router;