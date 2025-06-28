import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connetDB from './configs/mongodb.js'
import { clerkWebHooks, stripeWebhooks } from './controllers/webhooks.js'
import { clerkMiddleware } from '@clerk/express'
import educatorRouter from './routes/educatorRoutes.js'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoutes.js'
import userRouter from './routes/userRoutes.js'

//Intialize Express
const app=express()

//connect to database
await connetDB()
await connectCloudinary()

//Middleware
app.use(cors())
app.use(clerkMiddleware())

//Routes
app.get('/',(req,res)=>res.send("API working"))
app.post('/clerk', express.json(), clerkWebHooks)
app.use('/api/educator',express.json(),educatorRouter)
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)
app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

//Port
const PORT=process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})

