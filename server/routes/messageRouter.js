const router = require("express").Router();
const { addMesssage, getMessage } = require('../controller/messageController')
const auth = require("../middleware/auth")


router.post('/addmessage',auth, addMesssage)
router.post('/getmessage',auth, getMessage)
// router.post('/upload',auth,  uploadFile)





module.exports = router