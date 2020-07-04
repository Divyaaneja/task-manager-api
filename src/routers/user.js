const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail,sendCancelationEmail } = require('../emails/account')

router.post('/users', async (req,res)=>{
    
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user , token})
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req,res )=>{
    try {
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req,res)=>{
    const userUpdates = Object.keys(req.body)
    const allowedUpdates = ['name','age','email','password']
    const isValidOperation = userUpdates.every((update)=> allowedUpdates.includes(update) )
    if(!isValidOperation){
        return res.status(400).send({error:'Inavalid Updates!'})
    }

    try {
        userUpdates.forEach((update)=>{
            req.user[update] = req.body[update]
        })

        await req.user.save()

        res.send(req.user)
    } catch (error) {
        res.status(400).send()
    }
})


router.get('/users/me',auth, async (req,res)=>{
    res.send(req.user)
})


router.delete('/users/me',auth, async (req,res)=>{
    try {
        
        await req.user.remove()
        sendCancelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }

})

const upload = multer({
    //dest: 'avatars',
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if( !file.originalname.match(/\.(jpg|jpeg|pdf)$/)){
            return cb(new Error('please upload jpg ,jpeg or pdf file'))
        }
        cb(undefined,true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height:250 , width:250 }).png().toBuffer()
    req.user.avatar = buffer
    //req.user.avatar = req.file.buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send( { error:error.message } )
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    try {
        if( req.user.avatar === undefined){
            throw new Error('Not found')
        }

        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(404).send()
    }
})

router.get('/users/:id/avatar',async (req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        if( !user || !user.avatar ){
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router














// route.get('/users',auth, async (req,res)=>{

//     try {
//         const user = await User.find({})
//         res.send(user)
//     } catch (error) {
//         res.status(500).send(error)
//     }

//     // User.find({}).then((user)=>{
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send(e)
//     // })
// })


// route.get('/users/:id', async (req,res)=>{
//     const _id=req.params.id

//     try {
//         const user = await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (error) {
//         res.status(500).send()
//     }
// })



// route.patch('/users/:id', async (req,res)=>{
//     const userUpdates = Object.keys(req.body)
//     const allowedUpdates = ['name','age','email','password']
//     const isValidOperation = userUpdates.every((update)=> allowedUpdates.includes(update) )
//     if(!isValidOperation){
//         return res.status(400).send({error:'Inavalid Updates!'})
//     }

//     try {
//         const user = await User.findById(req.params.id)
//         userUpdates.forEach((update)=>{
//             user[update] = req.body[update]
//         })

//         await user.save()

//       // const user =  await User.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     } catch (error) {
//         res.status(400).send()
//     }
// })