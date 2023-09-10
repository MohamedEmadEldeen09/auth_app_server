
// require('dotenv').config()
// const client = require('twilio')
// (process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


// const sendPhoneMessage =async (recieverPhone , messageBody)=>{
//     try {
//         const info = await client.messages.create({
//             from:process.env.TWILIO_SERVICE_PHONE ,
//             to:recieverPhone,
//             body:messageBody
//         })
    
//         console.log(info);
        
//         if(info?.sid){
//             return {
//                 state:"success",
//                 info
//             }
//         } 
//         return {
//             state:"failure",
//             info
//         }
//     } catch (error) {
//         console.log(error);
//         return {
//             state:"failure",
//             error
//         }
//     }
// }

// module.exports = sendPhoneMessage


// // client.messages
// //       .create(
// //         {
// //             body: 'Hi there', 
// //             from: process.env.TWILIO_SERVICE_PHONE 
// //             to: '+15558675310'
// //         })
// //       .then(message => console.log(message.sid))
// //       .catch(error=>console.log(error))