const localStrategy = require('passport-local').Strategy
const User = require('../models/UserModel')
const bcrypt = require('bcrypt')

initializePassport = (passport)=>{
    passport.use(new localStrategy({
     usernameField:'email'
    } ,async (email , password , done)=>{
 
     if(email && password){
         const result =await User.findUserByEmail(email)
         
         if(!result?.user){
            return done(null , false) //there is no user with this email
         } 
         
         const user = result.user
         const isMatch = await bcrypt.compare(password , user.user_password)

         if(isMatch) {
            return done(null , user)
         }
 
         return done(new Error('Password is wrong!') , null)
          
     }else{      
         return done(new Error('No input!'), null)
     } 
    }))
 
 
    passport.serializeUser((user , done) =>{
     return done(null , user.user_id)
    })
    
    passport.deserializeUser(async (id , done) => {
      try {
         const result =await User.findUserById(id)
         if(!result?.user) return done(new Error("user not found") , false )       
         const user = result.user
         return done(null , user)
   
      } catch (error) {
         console.log(error);
         return done(new Error('Error on the sever please try again!') , null)
      }
    })
 }
 
 
 module.exports = initializePassport