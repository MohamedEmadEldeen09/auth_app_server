require('dotenv').config()
const User = require('../models/UserModel')
//const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const sendEmail = require('../helper/sendEmail')


//data folder path
const dataFolderDirectory = path.join(__dirname , '../data')
//


class UserController {
  
  //add user  --post
  static async addUser(req , res){
    const {user_first_name,user_last_name,user_birth_date,user_gender,
        user_phone_national,user_phone_international,
        user_phone_country_code,user_email,user_password,
        user_phone_verified,user_email_verified} = req.body

    const user = new User(user_first_name,user_last_name,user_birth_date,user_gender,
        user_phone_national,user_phone_international,
        user_phone_country_code,user_email,user_password,
        user_phone_verified,user_email_verified)
    
    const result = await user.save()
    if(result.state == "failure"){
      return res.json({registration_result:result})
    }
    
    //ok user registred well but we need to verify his email
    const temp_secret = process.env.TOKEN_SECRET + user.user_password
    const token = jwt.sign({id : user.user_id} ,temp_secret)
    const verficationLink = `${process.env.SERVER_DOMAIN}/user/acivation-acount/verification/${user.user_id}/${token}`
  
    
    //send email
    const html = `<h4>Verify your account</h4>
    <p>Click on this link to verify your account, 
    you will be redirected to the log in page</p>
    <a href=${verficationLink}>${verficationLink}</a>`

    const successResponse = {state_email : "success" , 
    message_email:"Email sended successfully!",
    registration_result:result}

    const failureRespose={state_email : "failure" , 
    message_email:"Faild to send the email!, your email is not a valid email",
    registration_result:result}

    return sendEmail(user.user_email,"Activation Account",
    html,res,successResponse,failureRespose)
   // 

  }

  //get all users  --get
  static async getallUsers(req , res){
        const result = await User.findAllUsers()
        if(result.state == "failure"){
        res.json(result).status(500)
        }
        res.json(result)
  }

  //get one user by id  --get
  static async getUser(req , res){
    const result = await User.findUserById(req.params.id)
    res.json(result)
  }

  //get one user by email  --post
  static async getUserByEmail(req , res){
    const {email} = req.body
    const result = await User.findUserByEmail(email.email) 
    res.json(result)
  }
  
  //delete one user by id   --delete
  static async deleteUser(req , res){
    const result = await User.deleteUserById(req.params.id)
    res.json(result)
  }

 //update user by id   --patch
 static async updateUser(req , res){
    const result = await User.updateUserById(req.body , req.params.id)
    if(result.state == "failure"){
        res.json(result).status(500)
    }
    res.json(result).status(201)
 }

 //update user profile image  --post
 static async updateProfileImage(req , res){
  //check
  if(!req.files || !req.files.profile_avatar || Object.keys(req.files).length == 0){
    res.send('no file uploaded!')
    return
  } 
   
  const {id} = req.params
  const profile_avatar = req.files.profile_avatar  
  
  //to create a uniqe name 
  const pictureType = profile_avatar.mimetype  // image/jpg

  const extendValue = pictureType.substring(6,pictureType.length) // jpg

  let newImageName = `profile_avatar_${id}.${extendValue}`
  
  //if he already has a profile image remove it first
  if(fs.existsSync(`${dataFolderDirectory}/_${id}`)){   
    fs.readdirSync(`${dataFolderDirectory}/_${id}` , (err , data)=>{
      if(err) return res.json({state:"failure" , error:err})

      const existingPicture = data.find((fileOrFolder)=>{
        return fileOrFolder.includes(`profile_avatar`)
      })

      if(existingPicture){
        fs.unlinkSync(`${dataFolderDirectory}/_${id}/${existingPicture}`, (err)=>{
          if(err) return res.json({state:"failure" , error:err})        
        })
      }
    })  
  }
  //

  //to save in that specific folder
  const newImagePath = path.join( dataFolderDirectory,`_${id}`, newImageName)
  
  //move that file into that folder
  profile_avatar.mv(newImagePath ,async (error)=>{
    if (error){
      return res.json({
      state : "failure", 
      message : "File not saved correctrlly!, please try again" ,
      error:error.message})
    }  
    
    return res.redirect(`${process.env.CLIENT_DOMAIN}/dashboard/user/profile`)
  })
 }

 //get user profile image  --get 
 static async getUserProfileImage(req , res){
   const {id} = req.params

   const defaultAvatarPath = `${dataFolderDirectory}/default_profile_image.jpg`

   if(fs.existsSync(dataFolderDirectory+"/_"+id)){     
      fs.readdir(dataFolderDirectory+"/_"+id , (error , data)=>{
        if(error) return res.sendFile(defaultAvatarPath)
        const existingPicture = data.find((fileOrFolder)=>{
          return fileOrFolder.includes(`profile_avatar`)
        })
        console.log('existingPicture' , existingPicture);
        if(existingPicture != undefined){
          const userAvatarPath=`${dataFolderDirectory}/_${id}/${existingPicture}`
          return res.sendFile(userAvatarPath)
        }else{
          return res.sendFile(defaultAvatarPath)
        }       
      })         
    }else{
      return res.sendFile(defaultAvatarPath)
    }
 }

 //middleware
 static async ifJwtValid(req, res , next){
  const {id , token} = req.params
  const result =await User.findUserById(id) 
  if(result.state =="success" && result?.user){
      const user = result.user
      const temp_secret = process.env.TOKEN_SECRET + user.user_password
      jwt.verify(token , temp_secret ,async (error , decoodedToken)=>{
          if(error){
            //if error
            return  res.redirect(`${process.env.CLIENT_DOMAIN}/recognize/key_user/email_verify_failed`)
          }

          const result = await User.updateUserById(
            {user_email_verified:true},id)
          next()
      })
  }else{
      return  res.redirect(`${process.env.CLIENT_DOMAIN}/recognize/key_user/email_verify_failed`)
  }
  
 }
 //

 //for verification email --get
 static async confirmUrlVerification(req, res){
   //if middleware success
   //you will need to redirect to the login react component
    res.redirect(`${process.env.CLIENT_DOMAIN}/recognize/key_user/log_in`)
 }
}


module.exports = UserController