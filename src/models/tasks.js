const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})

const task = mongoose.model('task',taskSchema)

module.exports = task



//ref:'User' this sets the relationship between two models task and user
//after setting the realtionship between them,  await Task.populate('owner').execPopulate() we can acquire
//complete user profile from task and we can also reverse this i.e from user id we can acquire complete task
//but for this tasks field must be there in users model to grab that task so instead of destructing complete user model we can set virtual filed
//virtual is just for mongoose and not stored on data base to decide who owns what ie how these 2 are related