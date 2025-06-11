import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connetDB from './configs/mongodb.js'
import { clerkWebHooks } from './controllers/webhooks.js'

//Intialize Express
const app=express()

//connect to database
await connetDB()

//Middleware
app.use(cors())

//Routes
app.get('/',(req,res)=>res.send("API working"))
app.post('/clerk', express.json(), clerkWebHooks)

//Port
const PORT=process.env.PORT || 5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})