const express = require('express')
const router = new express.Router()
const task = require('../models/tasks')
const auth = require('../middleware/auth')
require('../db/mongoose')



router.post('/tasks', auth,async (req,res)=>{
    //const Task = new task(req.body)
    const Task = new task({
        ...req.body,
        owner:req.user._id
    })
    try {
         await Task.save()
        res.status(201).send(Task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/tasks/:id', auth,async (req,res)=>{
    const userUpdates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    const isValidOperation = userUpdates.every( (update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error:'Invalid Updates!'})
    }

    try {
        const Task = await task.findOne( { _id:req.params.id, owner:req.user._id} )
        if( !Task){
            res.status(404).send()
        }
        userUpdates.forEach((update)=>{
            Task[update] = req.body[update]
        })
        await Task.save()
        //const Task = await task.findByIdAndUpdate(req.params.id, req.body, {new:true,runValidators:true})
        
        res.send(Task)
    } catch (error) {
        res.status(400).send()
    }
})

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=10
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth,async (req,res)=>{
    const match = {}
    const sort = {}
    if( req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc'?-1:1
    }


    try {
       const user = req.user
       await user.populate({
           path:'tasks',
           match,
           options:{
               limit:parseInt(req.query.limit),
               skip:parseInt(req.query.skip),
               sort
           }
       }).execPopulate()
       res.send(user.tasks)
    } catch (error) {
        res.status(500).send()
    }
})


router.get('/tasks/:id', auth,async (req,res)=>{
    const _id = req.params.id

    try {
        //const Task = await task.findById(_id)
        const Task = await task.findOne({ _id, owner:req.user._id })

        if(!Task){
            return res.status(404).send()
        }
        res.send(Task)
    } catch (error) {
        res.status(500).send()
    }
})

router.delete('/tasks/:id', auth,async (req,res)=>{
    try {
        //const Task = await task.findByIdAndDelete(req.params.id)
        const Task = await task.findOneAndDelete({ _id:req.params.id, owner:req.user._id })
        if(!Task){
            res.status(404).send()
        }
        res.send(Task)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router



















// route.get('/tasks', async (req,res)=>{
    
//     try {
//         const Task =  await task.find({})
//         res.send(Task)
//     } catch (error) {
//         res.status(500).send()
//     }
// })
