require('dotenv').config()
const User = require('../models/UserModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const generateOTP = require('../helper/generateOTP')
const sendEmail = require('../helper/sendEmail')


class UserUpdateProfileController {  
    //middleware 
    //to check user and token
    static isTokenOtpValid = async (req , res , next)=>{ 
        const {user_id , token , otpFromUserInput} = req.body
        const result = await User.findUserById(user_id)
        if(result.state =="success" && result?.user){
            const user = result.user
            const temp_secret = process.env.TOKEN_SECRET + user.user_password
            jwt.verify(token , temp_secret ,async (error , decoodedToken)=>{
                if(error){
                    return res.json({
                    state:"failure",
                    errorType:"token",
                    message:"There is an error!, it looks like the code period expired!",
                    error
                    })
                } 
                
                const {code} = decoodedToken
                if(code != otpFromUserInput){
                    return res.json({
                        state:"success",
                        errorType:"otp",
                        message:"The code does not match",
                    })                
                }
    
                next()               
            })
        }
        else{
            if(result.state =="success"){
                return res.json({
                    state:"failure",
                    errorType:"user_id",
                    result
                })
            }else{
                return res.json({
                    state:"failure",
                    errorType:"db",
                    result
                })
            }                    
        }        
    }
    //

    //---------otp process-----------
    //send otp within an email in order to check that that user is the real user
    static async sendOTP(req , res){
        const {user_id}  = req.body

        //generate otp
        const otp = generateOTP(6)
        //
        
        const result = await User.findUserById(user_id)
        if(result.state =="success" && result?.user){
            const user = result.user
            const temp_secret = process.env.TOKEN_SECRET + user.user_password
            const token = jwt.sign({id : user_id , code:otp} ,temp_secret ,
                {expiresIn:'5m'})
            
            //send email
            const emailBody = `inter this code ${otp} to verify. 
            this code will expire in 5 minutes`
            const successResponse = {
                state : "success" , 
                message:"Email sended successfully!",
                token
            }
    
            const failureRespose={
                state: "failure" , 
                message:"Faild to send the email!, your email is not a valid email",           
            }
    
            return  sendEmail(user.user_email , 'Talks_App Code',emailBody,res,
            successResponse,failureRespose)
            //
        }else{
         return res.json({
            state: "failure" , 
            message:"User not found!",
         })
        }
    }
    //submit and check otp
    static async postOTP(req , res){
      const {user_id , target} = req.body
      if(target == 'key_verify_email'){
        const result =await User.updateUserById({user_email_verified:true},user_id)
        return res.json({isOtpValid:true , ...result})
      }
      else{
       return res.json({
            state:"success",
            message:"The code do match successfully!",
            isOtpValid:true
        })
      }     
    }
    //

    //-------phone process----------
    //update existing phone
    static async postResetPhone(req , res){
      const {user_id, phone}= req.body      
      const result = await User.updateUserById(phone , user_id)
      res.json(result)
    }
    //

    //---------password process-----------
    //update the existing password
    static async patchResetPassword(req , res){
        const {user_id, newPassword}= req.body   
        // if(oldPassword == newPassword){
        //     return res.json({
        //         state:"failure",
        //         erorrType : "user",
        //         message:"New Password can not be the same old password"
        //     })
        // }             
        // const result = await User.findUserById(user_id)     
        // if(result?.user){
        //    const user = result.user
          // const isMatch =await bcrypt.compare(oldPassword , user.user_password)
        //    if(isMatch == true){
        //        const salt =await bcrypt.genSalt(10)
        //        const hashedNewPassword = await bcrypt.hash(newPassword,salt)
        //        const resultFromUpdate = await User.updateUserById({
        //        user_password:hashedNewPassword},user_id)
        //        return res.json({...resultFromUpdate , isMatch})
        //    }
        //    else{
        //     return res.json({
        //         state:"failure",
        //         erorrType : "user",
        //         message:"Old Password not correct!"
        //     })
        //    }    
        // }else{
        //   return res.json(result)
        // }             
        if(newPassword != ""){
            const salt =await bcrypt.genSalt(10)
            const hashedNewPassword = await bcrypt.hash(newPassword,salt)
            const resultFromUpdate = await User.updateUserById({
            user_password:hashedNewPassword},user_id)
            return res.json({...resultFromUpdate})
        }else{
            return res.json({error:'No input found!'})
        }
    }

    //to check password is right for more authontication for updates data purposes
    static async postCheckPassword(req , res){
        const {user_id , password}= req.body                
        const result = await User.findUserById(user_id) 
        if(result?.user){
            const user = result.user
            const isMatch =await bcrypt.compare(password , user.user_password)
            if(isMatch){
                return res.json({
                    state:"success",
                    message:"Password matched successfully!",
                    isMatch:true
                })
            }else{
                return res.json({
                    state:"failure",
                    erorrType : "user",
                    message:"Password not correct!",
                    isMatch:false
                })
            }                     
        }else{
            return res.json(result)
        }              
    }
    //
  
    //----------email process------------
    //update the existing email
    static async patchResetEmail(req , res){
        const { user_id, newEmail}= req.body        
        const result = await User.updateUserById(
            { user_email:newEmail , user_email_verified:false},user_id)
        res.json(result)           
    }
    //

    //-------first_name last_name date_name  process------
    //update the existing first_name last_name date_name
    static async patchFnameLnameDate(req , res){
        const {user_id , changes} = req.body
        const result = await User.updateUserById(changes,user_id)
        res.json(result)
    }
    //   
}


module.exports = UserUpdateProfileController