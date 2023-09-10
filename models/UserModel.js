
const db = require('../config/database_connection')
require('dotenv').config()
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')

//data folder path
const dataFolderDirectory = path.join(__dirname , '../data')

class UserModel{

  constructor(first_name , last_name , birth_date,gender
    , phone_national ,phone_international,phone_country_code, email , password,
    user_phone_verified,user_email_verified){
    this.user_first_name = first_name
    this.user_last_name = last_name
    this.user_birth_date = birth_date
    this.user_gender = gender
    this.user_phone_national = phone_national
    this.user_phone_international = phone_international
    this.user_phone_country_code = phone_country_code
    this.user_email = email
    this.user_password = password
    this.user_phone_verified = user_phone_verified
    this.user_email_verified = user_email_verified
  }

  //add user --post
  async save(){
    try {
        //hash password
        const salt =await bcrypt.genSalt(10)
        const hashedPassword =await bcrypt.hash(this.user_password,salt)
        this.user_password = hashedPassword
        //
        

        //save information
        const [results , _] =await db.execute(process.env.SQL_QUERY_ADD_USER 
            ,[this.user_first_name,this.user_last_name,this.user_email,this.user_password
            ,this.user_gender,this.user_birth_date,this.user_phone_national,
            this.user_phone_international,this.user_phone_country_code,
            this.user_phone_verified,this.user_email_verified])
        this.user_id =results.insertId

        //create folder for that user to store profile_image and messages content
         if(!fs.existsSync(dataFolderDirectory+"/_"+this.user_id)){
           fs.mkdir(dataFolderDirectory+"/_"+this.user_id , (err)=>{
            if(err) console.log(err);
            fs.mkdir(dataFolderDirectory+"/_"+this.user_id +"/messages_content_files",
             (err)=>{
              console.log(err);
            })
           })        
         }
         //

        return {state : "success", message : "user has been add successfully!" , results}
    } catch (error) {
        console.log(error.message);
        return {state : "failure", message : "Server is too busy try later!" ,
          error:error.message}
    }
  }
  
  //get all users   --get
  static async findAllUsers(){
    try {
        const [results , _] =await db.execute(process.env.SQL_QUERY_GET_ALL_USERS)
        return {state : "success", message : "Here is all the users" , results}
    } catch (error) {
        console.log(error.message);
        return {state : "failure", message : "Server is too busy try later!" ,
        error:error.message}
    }
  }

  //get user by id   --get
  static async findUserById(idForSearch){
    try {
        const [results , _] =await db.execute(process.env.SQL_QUERY_GET_USER_BY_ID
            ,[idForSearch])
        
        if(results.length>0){
          const {user_id,user_first_name,user_last_name,user_birth_date,user_gender
        ,user_phone_national,user_phone_international,user_phone_country_code,
        user_email,user_password,user_phone_verified,user_email_verified} =results[0]

          const user = new UserModel(user_first_name,user_last_name,user_birth_date,user_gender
            ,user_phone_national,user_phone_international,user_phone_country_code,
            user_email,user_password,user_phone_verified,user_email_verified)
          
            user.user_id = user_id 
          return {state : "success", message : "User founded successfully!" , user}
        }else{
          return {state : "success", 
          message : "User not founded!, There is no user with this id." 
          , results}
        }             
    } catch (error) {
        console.log(error.message);
        return {state : "failure", message : "Server is too busy try later!" ,
        error:error.message}
    }
  }

  //for login process --> find user by email
  static async findUserByEmail(email){
    try {
      const [results , _] =await db.execute(process.env.SQL_QUERY_GET_USER_BY_EMAIL
          ,[email])      
      
      if(results.length>0){        
        const {user_id,user_first_name,user_last_name,user_birth_date,user_gender
      ,user_phone_national,user_phone_international,user_phone_country_code,
        user_email,user_password,user_phone_verified,user_email_verified} =results[0]

        const user = new UserModel(user_first_name,user_last_name,user_birth_date,user_gender
          ,user_phone_national,user_phone_international,user_phone_country_code,
            user_email,user_password,user_phone_verified,user_email_verified)
        
          user.user_id = user_id 
        return {state : "success", message : "User founded successfully!" , user}
      }else{
        return {state : "success", message : "User not founded!, There is no user with this email." 
        , results:results}
      }             
  } catch (error) {
      console.log(error.message);
      return {state : "failure", message : "Server is too busy try later!" ,
        error:error.message}
  }
  }

  //delete user account by id   --delete
  static async deleteUserById(id){
  try {
      const [results , _] =await db.execute(process.env.SQL_QUERY_DELETE_USER 
          ,[id])  
      if(results.affectedRows == 0){
        return {state : "success", message : "User not founded!, There is no user with this id.", results} 
      } 

      //remove store folder for that user 
      if(fs.existsSync(dataFolderDirectory+"/_"+id )){
        console.log(dataFolderDirectory+"/_"+id);
        fs.rmdir(dataFolderDirectory+"/_"+id,
        { recursive: true } , (err)=>{
          if(err) console.log(err);          
        })        
      }
      //    

      return {state : "success", message : "user has been deleted successfully!!" , results}
  } catch (error) {
      console.log(error.message);
      return {state : "failure", message : "Server is too busy try later!" ,
        error:error.message}
   }
  }

  //update user information by id  --patch
  static async updateUserById(body , id){
    //generate the query based on data from the body object
    let queryForUpdate =process.env.SQL_QUERY_UPDATE_USER_PART1

    Object.keys(body).forEach((key , index)=>{             
      if(index == Object.keys(body).length-1) queryForUpdate+=` ${key}=? `
      else queryForUpdate+=` ${key}=?,`                     
    }) 
    
    queryForUpdate+=process.env.SQL_QUERY_UPDATE_USER_PART2
    //
    
    //extract the values from body object
    let valuesFromBody = Object.values(body)
    //
     
    //update information
    try {
      const [results,_] = await db.execute(queryForUpdate , [...valuesFromBody , id])
      if( results.affectedRows == 0){
        return {
          state : "success", 
          error : "User Not Found!, there is no user with this id",
          results
        }
      }else{
        return {
          state : "success", 
          message : "user has been partially updataed successfully!",
          results
      }
      }
    } catch (error) {
      console.log(error.message);
      return {state : "failure", message : "Server is too busy try later!" ,
        error:error.message}
    }
  }

}


module.exports = UserModel