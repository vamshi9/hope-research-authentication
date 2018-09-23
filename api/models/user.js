const mongoose = require('mongoose');

const userSchema = {
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        required: true
    },
    email:{
        type: String,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    reset_password_token:{
        type: String
    },
    reset_password_expires:{
        type: String
    }
};

module.exports = mongoose.model('User', userSchema);
