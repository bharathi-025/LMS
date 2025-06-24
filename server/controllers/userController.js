import Stripe from "stripe"
import Course from "../models/Course.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"

//Get user data
export const getUserData=async(req,res)=>{
    try {
        const userId=req.auth.userId
        const user=await User.findById(userId)

        if(!user){
            return res.json({success:false,message:'User not found'})
        }
        res.json({success:true, user})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

//User enrolled courses with lecture links
export const userEnrolledCourses= async(req,res)=>{
    try{
        const userId=req.auth.userId
        const userData=await User.findById(userId).populate('enrolledCourses')
        res.json({success:true, enrolledCourses:userData.enrolledCourses})
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

//Purchase course
export const purchaseCourse=async(req,res)=>{
    try {
        const {courseId} =req.body
        const {origin} =req.headers
        const userId=req.auth.userId
        const courseData= await Course.findById(courseId)
        const userData=await User.findById(userId)

        if(!userData||!courseData){
            return res.json({success:false,message:error.message})
        }

        const purchaseData={
            courseId : courseData._id,
            userId,
            amount:(courseData.coursePrice-courseData.discount*courseData.coursePrice/100).toFixed(2)
        }

        const newPurchase= await Purchase.create(purchaseData)

        //Stripe gateway initialize
        const stripInstance=new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency=process.env.CURRENCY.toLowerCase()

        //creating line items to for stripe
        const line_items=[{
            price_data:{
                currency,
                product_data:{
                    name:courseData.courseTitle
                },
                unit_amount:Math.floor(newPurchase.amount)*100
            },
            quantity:1
        }]

        const session=await stripInstance.checkout.sessions.create({
            success_url:`${origin}/loading/my-enrollments`,
            cancel_url:`${origin}/`,
            mode:'payment',
            line_items:[],
            payment_intent_data:{
            metadata:{
                purchaseId: newPurchase._id.toString()
            }
        }
        })
        res.json({success:true,session_url:session.url})

    } catch (error) {
        res.json({success:false, message:error.message})
    }
}