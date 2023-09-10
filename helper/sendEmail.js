require('dotenv').config()
const nodemailer = require('nodemailer')

const sendEmail = (user_email ,subject,html,res,successResponse,failureRespose)=>{
    const transporter  = nodemailer.createTransport({
        service:"gmail",
        auth:{
          user:process.env.OWNER_USER_APP,
          pass:process.env.OWNER_PASSWORD_APP
        }
     })
    transporter.sendMail({
      from:process.env.OWNER_USER_APP,
      to:user_email,
      subject:subject,
      text:subject,
      html : html
     } , (error , info)=>{
       if(error) return res.json(failureRespose)
      return  res.json(successResponse)
     })
}

module.exports = sendEmail