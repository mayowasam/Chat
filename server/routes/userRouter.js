const router = require("express").Router();
const { register, login,getUser, getAllUser, uploadFile, tokenRefresh, logout } = require('../controller/userController')
const auth = require("../middleware/auth")


// const { join, extname } = require("path")
// console.log(join(__dirname));
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // console.log(join(__dirname, '../upload/avatar'));  
//         cb(null, './upload/avatar')
//     },
    
//     filename: function (req, file, cb) {
//         // console.log(file);
//         // console.log( `${file.fieldname}-${Date.now()}${extname(file.originalname)}`);
//         return cb(null, `${file.fieldname}-${Date.now()}${extname(file.originalname)}`)
//     }
// })
// const upload = multer({ storage: storage })



router.post('/register', register)
router.post('/login', login)
router.get('/refreshToken', tokenRefresh)
// router.post('/upload', upload.single("avatar"), uploadFile)
router.post('/upload',auth,  uploadFile)
router.get('/getuser',auth, getUser)
router.get('/getalluser',auth, getAllUser)
router.get('/logout', logout)





module.exports = router