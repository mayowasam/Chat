const {model, Schema} = require("mongoose")


const messageSchema = new Schema({
    message:{
        text:{
            type: String,
            required: true,
           
        }
    },
    users: Array,
    sender:{
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
    }  

},{
    timestamps:true
})



module.exports = Message = model("message", messageSchema)