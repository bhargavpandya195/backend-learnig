import { Router } from 'express';
import {registerUser ,loginUser ,logoutUser} from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middlewares.js"; 
import { verifyJWT } from "../middlewares/auth.middlwares.js";


const router = Router();

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 }, 
    { name: 'coverImg', maxCount: 1 }
  ]),
  registerUser
);

router.route('/login').post(loginUser);

//secure routes
router.route('/logout').post(verifyJWT,logoutUser);

export default router;
