const User = require('../model/User')
const Refresh = require('../model/Refresh')
const jwt = require("jsonwebtoken")
const handleErrors = require('../utils/Error')
const bcrypt = require("bcrypt")
const cloudinary = require('cloudinary')



// const multer = require("multer")
// const { join, extname } = require("path")

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // console.log(join(__dirname, '../upload/avatar'));  
//         cb(null, 'uploads/')
//     },

//     filename: function async(req, file, cb) {
//         // console.log(file);
//         return cb(null, `${file.fieldname}-${Date.now()}${extname(file.originalname)}`)
//     }

// })

// const upload = multer({ storage: storage }).single("avatar")


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})

const register = async (req, res) => {
    const { name, email, password } = req.body
    // console.log(req.body);
    try {
        let user = await User.findOne({ email })
        if (user) return res.status(400).json({ success: false, message: "user already exists" })
        const save = await User.create({ name, email, password })

        // create a user object to sign the jwt using the id retruned from the db

        let payload = {

            user: {
                id: save._id,
                name: save.name
            }
        }

        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "6h" })
        accessToken = `Bearer ${accessToken}`
        let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "24h" })
        await Refresh.create({ user: save._id, token: refreshToken })
        const result = await User.findOne({ email }).select('-password')
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true, // it must be false for postman to be able to store it
        })
        res.cookie('refreshToken', refreshToken)

        res.json({ success: true, message: "user successfully registered", data: result })
    } catch (error) {
        const errors = handleErrors(error)
        // console.log(errors);
        res.status(500).json({ success: false, message: errors })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    // console.log(req.body);
    try {
        let user = await User.findOne({ email })
        if (!user) return res.status(400).json({ success: false, message: "incorrect credentials" })
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) return res.status(400).json({ success: false, message: "incorrect credentials" })

        let payload = {

            user: {
                id: user._id,
                name: user.name
            }
        }

        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "6h" })
        accessToken = `Bearer ${accessToken}`
        let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: "24h" })
        await Refresh.create({ user: user._id, token: refreshToken })
        const result = await User.findOne({ email }).select('-password')

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true, // it must be false for postman to be able to store it
        })
        res.cookie('refreshToken', refreshToken)

        res.json({ success: true, message: "log in success", data: result })
    } catch (error) {
        const errors = handleErrors(error)
        // console.log(errors);
        res.status(500).json({ success: false, message: errors })
    }
}

const tokenRefresh = async (req, res) => {
    const { refreshToken } = req.cookies
    // console.log(refreshToken);
    try {
        if (!refreshToken) return res.status(400).json({ success: false, message: "no refreshtoken sent" })
        const validToken = await Refresh.findOne({ token: refreshToken })
        if (!validToken) return res.status(400).json({ success: false, message: "refreshtoken invalid" })
        const decodeToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)
        // console.log(decodeToken);
        if (!decodeToken) return res.status(400).json({ success: false, message: "Invalid token" })




        let accessToken = jwt.sign(decodeToken.user, process.env.ACCESS_TOKEN, { expiresIn: "30m" })
        accessToken = `Bearer ${accessToken}`
        // console.log('tokenrefreshacces',accessToken);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true, // it must be false for postman to be able to store it
        })

        res.json({ success: true, message: true })

    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// const uploadFile = async (req, res) => {


//     upload(req, res, async function (err) {
//         if (err instanceof multer.MulterError) {
//             res.json({ success: false, message: "multer error" })
//         } else if (err) {
//             res.status(500).json({ success: false, message: err.message })

//         }




//         // console.log('req', req);

//         // console.log('req.file', req.file);
//         // console.log(user);
//         // console.log(req.file.filename);
//         let user = await User.findById({ _id: req.user.id })
//         let path = `${process.env.URL}${process.env.PORT}/${req.file.filename}`
//         user.avatar = path
//         user.isAvatar = true
//         user = await User.findOneAndUpdate({ _id: req.user.id }, { $set: user }, { new: true })
//         // console.log(user);
//         const data = await User.findOne({ _id: req.user.id }).select('-password')
//         return res.status(200).json({ success: true, data, message: "profile picture added" })

//      })
//         // console.log('req.file', req.file);





//     // res.json ("working")
// }

const upload = async (file) => {
    const image = await cloudinary.uploader.upload(
        file,
        { folder: "Friends" },
        result => result
    );
    return image
}
const uploadFile = async (req, res) => {
    try {

        if (!req.files) return res.status(400).json({ success: false, message: "no image sent" })
        // console.log(req.files.avatar);
        const { avatar } = req.files
        const fileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const imageSize = 1024;
        if (!fileTypes.includes(avatar.mimetype)) return res.status(400).json({ success: false, message: "image type not supported" })
        if (avatar.size / 1024 > imageSize) return res.status(400).json({ success: false, message: `image should be less than ${imageSize}` })
        const image = await upload(avatar.tempFilePath)
        // console.log(image);
        // res.status(200).json({ message: "Image successfully uploaded", imageUrl: image.url })


        let user = await User.findById({ _id: req.user.id })
        user.avatar = image.url
        user.isAvatar = true
        user = await User.findOneAndUpdate({ _id: req.user.id }, { $set: user }, { new: true })
        // console.log(user);
        const data = await User.findOne({ _id: req.user.id }).select('-password')
        return res.status(200).json({ success: true, data, message: "profile picture added" })

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message })

    }





    //         // console.log('req', req);

    //         // console.log('req.file', req.file);
    //         // console.log(user);
    //         // console.log(req.file.filename);
    //         let user = await User.findById({ _id: req.user.id })
    //         let path = `${process.env.URL}${process.env.PORT}/${req.file.filename}`
    //         user.avatar = path
    //         user.isAvatar = true
    //         user = await User.findOneAndUpdate({ _id: req.user.id }, { $set: user }, { new: true })
    //         // console.log(user);
    //         const data = await User.findOne({ _id: req.user.id }).select('-password')
    //         return res.status(200).json({ success: true, data, message: "profile picture added" })

    //      })
    //         // console.log('req.file', req.file);





    //     // res.json ("working")
}



const logout = async (req, res) => {
    const { refreshToken } = req.cookies
    // console.log(refreshToken); 
    try {
        await Refresh.findOneAndDelete({ token: refreshToken })

        res.cookie('accessToken', "", {
            expiresIn: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
            sameSite: true
        })
        res.cookie('refreshToken', "", {
            expiresIn: new Date(Date.now() + 5 * 1000),
            httpOnly: true,
            sameSite: true
        })
        res.status(200).json({ success: true, message: "token deleted" })


    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const getUser = async (req, res) => {
    try {
        // the middleware makes id in the req.user available
        const user = await User.findById(req.user.id).select('-password')
        res.json({ user })

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message })
    }
}

const getAllUser = async (req, res) => {
    try {
        //get all users expect the current user
        // console.log('req.user.id', req.user.id);
        // const users = await User.find({ _id: { $ne: req.user.id } }).select(["name", "email", "avatar", "_id",])
        const users = await User.find({ _id: { $nin: req.user.id } }).select(["name", "email", "avatar", "_id",])
        // console.log('allusers', users);
        res.json({ success: true, users })

    } catch (error) {
        res.status(500).json({ success: false, msg: error.message })
    }
}
module.exports = {
    register,
    login,
    tokenRefresh,
    uploadFile,
    logout,
    getUser,
    getAllUser

}