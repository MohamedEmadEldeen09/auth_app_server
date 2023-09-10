const {Router} = require('express')
const {UserLoginLocalControlller , passport} 
= require('../controllers/UserLoginLocalController')
const router = Router()



router.get('/logout' , UserLoginLocalControlller.logoutProcess)
router.get('/get_user', UserLoginLocalControlller.getUserAfterLogged)
//router.get('/is_logged_in', UserLoginLocalControlller.getAnyPage)
router.post('/login', (req , res,next)=>{
    passport.authenticate('local',(error , user , info)=>{
        if(error){
            console.log(error);
            return res.json({
                state:"failure",
                errorType:'user',
                isLogged:false,
                error:error.message
            })
        }        
        if(!user){           
            return res.json({
                state:"success",
                errorType:'user',
                isLogged:false,
                message:'The password in not correct!, No user found!'
            })
        } 
        req.logIn(user , (error)=>{
          if(error){
            console.log(err);
            return res.json({
                state:"failure",
                errorType:'server',
                isLogged:false,
                error:error.message
            })
          }

          return res.json({
            state:"success",
            isLogged:true,
            message:'User has logged successfully',
            user
        })
        })
    })(req,res,next)
})




module.exports = router