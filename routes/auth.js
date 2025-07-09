const express = require('express')
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../midddleware/fetchuser');

const JWT_Secret = process.env.JWT_Secret

//Route 1 : Create a user using : POST '/api/auth/createuser' . Doesn't require login 
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({min:3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Min. length for password is 6').isLength({min:6}),
    ] , async (req, res)=>{
       let success = false
    // If there are error , return bad request and error.
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({success, errors:errors.array()})
    };
    // Check whather the user with this email already exists or not
    try{
        console.log('first')
    let user = await User.findOne({email: req.body.email})
    if(user){
        return res.status(400).json({success, error: 'Sorry, a user with this email already exist.'})
    }
    const salt = await bcrypt.genSalt(10);
    const secPassword = await bcrypt.hash(req.body.password, salt)
    // Create a new User
    console.log('before creating user')
    user = await User.create({
        name: req.body.name,
        password: secPassword,
        email: req.body.email,
    })
    console.log('after')
    const data = {
        user: {
            id: user.id
        }
    }
    console.log('before auth token')
    const authToken = jwt.sign(data, JWT_Secret)
    success = true
    res.json({success, authToken})
    // Catch Error
}catch{
    console.error(errors.message)
    res.status(500).send('some internal error occured')
}
})

//Route 2 : Create a user using : POST '/api/auth/login' . Doesn't require login 
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be Blanked').exists(),
    ] , async (req, res)=>{
        let success = false
    // if there are errors it will throw bad request and errors
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    };
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if (!user) {
            success = false
            return res.status(400).json({success, error: 'Please try to login with correct crediantials'})
        }

        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success = false
            return res.status(400).json({success, error: 'Please try to login with correct crediantials'})
        }

        const data = {
            user: {
                id: user.id
            }
        }
        console.log('object')
        const authToken = jwt.sign(data, JWT_Secret)
        success = true
        res.json({success, authToken})

    } 
    catch{
        console.error(errors.message)
        res.status(500).send('some bbb internal server error occured')
    }
    }
   
)
//Route 3 : Create a user using : POST '/api/auth/getuser' . require login 
router.post('/getuser', fetchuser , async (req, res)=>{
    try {
        userId = req.user.id
        const user = await User.findById(userId).select('-password')
        res.send(user)
    }catch{
        console.error(errors.message)
        res.status(500).send('some bbb internal server error occured')
    }

})

module.exports = router