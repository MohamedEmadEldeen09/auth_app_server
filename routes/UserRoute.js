const {Router} = require('express')
const UserController = require('../controllers/UserController')
const router = Router()

router.get('/allusers' , UserController.getallUsers)
router.post('/upload_profile_avatar/:id' , UserController.updateProfileImage)
router.post('/' , UserController.addUser)
router.post('/get_user_by_email' , UserController.getUserByEmail)
router.get('/get_profile_avatar/:id' , UserController.getUserProfileImage)
router.delete('/delete_account/:id' , UserController.deleteUser)
router.route('/:id')
.get(UserController.getUser)
.patch(UserController.updateUser)

//for verify email
router.get('/acivation-acount/verification/:id/:token' ,
 UserController.ifJwtValid , UserController.confirmUrlVerification)

module.exports = router