const User = require('../model/User')
const Message = require('../model/Message')
const handleErrors = require("../utils/Error")



const addMesssage = async (req, res) => {
    const { from, to, message } = req.body
    // console.log(req.body);
    try {
        if (!message || !from || !to) return res.json({ success: false, message: "message unsuccessful" })

        let data = await Message.create({
            message: {
                text: message
            },
            users: [from, to],
            sender: from

        })

        if (data) return res.json({ success: true, message: "Message successfully added" ,data})
        res.json({ success: false, message: "message unsuccessful" })
    } catch (error) {
        // const errors = handleErrors(error)
        res.status(500).json({ success: false, message: error })
    }
}

const getMessage = async (req, res) => {
    const { from, to } = req.body
    // console.log(req.body);
    try {
        const messages = await Message.find({ users: { $all: [from, to] } }).sort({ updatedAt: 1 })
        const clientResponse = messages.map(message => ({
            fromSelf: message.sender.toString() === from,
            message: message.message, 
            date: message.createdAt.toLocaleTimeString()
        }))

        res.json({ success: true, message: "message successfully retrieved", data: clientResponse })
    } catch (error) {
        const errors = handleErrors(error)
        // console.log(errors);
        res.status(500).json({ success: false, message: errors })
    }
}



const uploadFile = async (req, res) => {


    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            res.json({ success: false, message: "multer error" })
        } else if (err) {
            res.status(500).json({ success: false, message: err })

        }

        // console.log('req.file', req.file);
        // console.log(user);
        // console.log(req.file.filename);
        let user = await User.findById({ _id: req.user.id })
        let path = `${process.env.URL}${process.env.PORT}/${req.file.filename}`
        user.avatar = path
        user.isAvatar = true
        user = await User.findOneAndUpdate({ _id: req.user.id }, { $set: user }, { new: true })
        // console.log(user);
        const data = await User.findOne({ _id: req.user.id }).select('-password')
        return res.status(200).json({ success: true, data, message: "profile picture added" })

    })





    // res.json ("working")
}



module.exports = {
    addMesssage,
    getMessage,
    // uploadFile,


}