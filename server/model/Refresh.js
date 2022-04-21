const { model, Schema } = require("mongoose")



const refreshSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    token: {
        type: String,
        required: [true, "refreshToken is required"]

    }

}, {

    timestamps: true
})



module.exports = Refresh = model("refreshToken", refreshSchema)