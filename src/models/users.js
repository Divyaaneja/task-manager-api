const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const task = require('./tasks')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        validate( value ) {
            if( value < 0 ){
                throw new Error('age must be a positive number!')
            }
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate( value ){
            if( !validator.isEmail(value)){
                throw new Error('input must be a valid email')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if( value.toLowerCase().includes("password") ){
                throw new Error('not a valid password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type: Buffer
    }
},
{
    timestamps:true
})
//providing timestamps as 2nd argument in the userSchrma sets when document is last created and updated


//here tasks is a virtual field that's not gonna affect database but create a relationship between two models usinf 'ref'

userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})



//here we are using methods instead of statics (methods for instances and statics for models) here we are generating tokens for individuL USER instance
//also using async function instead of arrow funcn for binding 'this'

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id:user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
} 

//if we are using another function name instead of toJSON(which is called whenever objects gets strigified) then we are unable to use this function with other routers unless we call them explicit
//toObject() converts document into json object
//hides password and token property 

userSchema.methods.toJSON =  function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


//login credential
userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({ email })
    if( !user ){
        throw new Error('Unable to login')
    }
    
    const isMatch = await bcrypt.compare(password,user.password)
    
    if( !isMatch ){
        throw new Error('Unable to login')
    }
    return user
}

//converts user password into hashed password
userSchema.pre('save', async function(next){
    const user = this

    if( user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    
    next()
})

//Delete tasks before removing user
userSchema.pre('remove', async function(next){
    const user = this
    await task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User