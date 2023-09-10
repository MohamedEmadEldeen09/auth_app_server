const {Router} = require('express')
const UserUpdateProfileController = require('../controllers/UserUpdateProfileController')
const router = Router()

//phone process
router.post('/reset_phone', UserUpdateProfileController.postResetPhone)

//email process
router.patch('/reset_email', UserUpdateProfileController.patchResetEmail)

//password process
router.patch('/reset_password', UserUpdateProfileController.patchResetPassword)
router.post('/check_password', UserUpdateProfileController.postCheckPassword)

//otp process
router.post('/send_otp', UserUpdateProfileController.sendOTP)
router.post('/submit_otp',
 UserUpdateProfileController.isTokenOtpValid,
 UserUpdateProfileController.postOTP)

//first_name last_name date_name  process
router.patch('/Fname_Lname_date', UserUpdateProfileController.patchFnameLnameDate)




module.exports = router