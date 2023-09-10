const passport = require('passport')
const initializePassport = require('../config/passport_local')

initializePassport(passport)

class UserLoginLocalControlller {
 //get authonticated user
 static async getUserAfterLogged(req , res){
  if(req.user){
    res.json({user:req.user})
  }else{
    res.json({user:null})
  }   
 }

 //logout
 static async logoutProcess(req , res){
    req.logOut((error)=>{
      if(error) return res.json({error})
      req.session.destroy()
     return res.json({state:"success" , message:"user loged out successfully"})
    }) 
 }

 //get any page 
//  static async getAnyPage(req , res){
//    if(req.isAuthenticated()){
//       return res.json({authonticated:true})
//    }
//    return res.json({authonticated:false})
//  }

}

module.exports = {UserLoginLocalControlller , passport}