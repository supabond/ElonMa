const mongoose = require('mongoose');
const bcrypts = require('bcryptjs');
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please ass a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, 'Please add a valid email']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next){
    const salt = await bcrypts.genSalt(10) ;
    this.password = await bcrypts.hash(this.password, salt) ;
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

// Match use entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypts.compare(enteredPassword, this.password) ;
}

module.exports = mongoose.model('User', UserSchema);