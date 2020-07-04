const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true,
    useFindAndModify:false
})



// const me = new User({
//     name:'   Jen  ',
//     email:' me2@gmail.com  ',
//     age:20,
//     password:'mypasscode'

// })

// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error!',error)
// })



// const t1 = new task({
//     description:'   Weather app   ',
//     completed:true
// })

// t1.save().then(()=>{
//     console.log(t1)
// }).catch((error)=>{
//     console.log(error)
// })

