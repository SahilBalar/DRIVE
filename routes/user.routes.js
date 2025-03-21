const express = require('express');
const router = express.Router();

//userModel which we created in models
const userModel = require('../models/user.models')

// Import express-validator
const { body, validationResult } = require('express-validator');

//bcrypt(used to hide password in a server like it convert our password to *** form) install using "npm i bcrypt" and then import
const bcrypt = require('bcrypt');

//jsonwebtoken for generating token if we were able to find user and password
const jwt = require('jsonwebtoken');
const { getToken } = require('next-auth/jwt');

// Render register page
router.get('/register', (req, res) => {
    res.render('register');
});


// Handle registration
router.post('/register', 
    [
        body('email').trim().isEmail().isLength({ min: 10 }).withMessage('Invalid email format'),
        body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    ], 
    async (req, res) => {
        console.log('Received Headers:', req.headers);  // Log headers
        console.log('Received Body:', req.body);        // Log body

        const errors = validationResult(req); 

        if (!errors.isEmpty()) {
            console.log('Validation Errors:', errors.array()); // Log errors
            return res.status(400).json({ errors: errors.array(), message: 'Invalid data' });
        }

        const { email, username, password } = req.body;
        
        //using bcrypt for password
        const hashPassword = await bcrypt.hash(password.trim(), 10)

        const newUser = await userModel.create({ email, username, password: hashPassword });

        res.json(newUser);
    }
);


// login page
router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', 
    body('username').trim().isLength({ min: 3 }),
    body('password').trim().isLength({ min: 5 }), 
    async (req, res) => {
        const errors = validationResult(req);
        
        // If there are validation errors
        if (!errors.isEmpty()) {
            console.log('Validation Errors:', errors.array());  // Log validation errors
            return res.status(400).json({
                error: errors.array(),
                message: 'Invalid data'
            });
        }

        // Get username and password from the request body
        const { username, password } = req.body;
        console.log('🟢 Login Request Received:', { username, password }); // Log login request

        // Find the user by username (case-insensitive)
        const user = await userModel.findOne({ username: new RegExp(`^${username}$`, 'i') });
        console.log('🔍 User Found in DB:', user); // Log found user

        // If the user is not found
        if (!user) {
            console.log('❌ User not found in DB');
            return res.status(400).json({
                message: 'Username or password is incorrect'
            });
        }

        // Log stored hashed password
        console.log('🔑 Stored Hashed Password:', user.password);

        // Compare provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password.trim(), user.password);

        console.log('🔍 Password Match Result:', isMatch); // Log password match result

        // If the password does not match
        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(400).json({
                message: 'Username or password is incorrect'
            });
        }

        // If both username and password are correct, generate a token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                username: user.username
            }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        console.log('✅ Token Generated:', token); // Log generated token

        // Send the token in the response
        res.json({ token });
    }
);

module.exports = router;
