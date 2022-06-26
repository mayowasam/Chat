const {model, Schema} = require("mongoose")
const bcrypt = require("bcrypt")

const emailReg = new RegExp(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(?!hotmail|outlook)(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)
const passwordReg = new RegExp (/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
const role = ['ADMIN', 'USER']

const userSchema = new Schema({
    name:{
        type: String,
        required: [true, "name is required"]

    },
    email:{
        type: String,
        required: true,
        unique: true, 
        validate:[(val) =>{
            return emailReg.test(val)
        }, 'Email must either be a gmail and yahoo mail']
    },
    password:{
        type: String,
        required: true,
        validate:[(val) =>{
            return passwordReg.test(val)
        }, 'Minimum of 8 characters must have at least one letter and one number']

    },
    isAvatar:{
        type: Boolean,
        default: false
    },
    avatar:{
        type: String,
        default: ""

    },
    role:{
        type: String,
        enum: role,
        default: 'USER'
    }

},{
    timestamps:true
})

userSchema.pre('save', async function(next) {
    const salt= await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    if(this.email === process.env.ADMINEMAIL) return this.role = role[0]
    next()
})

module.exports = User = model("user", userSchema)