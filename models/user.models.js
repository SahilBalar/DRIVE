const mongoose = require('mongoose');

//userSchema means its kind of blue print of user like hows user gonna see
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true, 
        minlength: [3, "Username must be at least 3 character long"]
    },

    email: {
        type: String,
        required: true, 
        trim: true,
        lowercase: true,
        unique: true, 
        minlength: [13, 'Email must be at least 13 character long']
    },

    password: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true, 
        minlength: [5, 'password must be at least 5 character long']
    }
});


const user = mongoose.model('user', userSchema)
module.exports = user;