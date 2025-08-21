const validator = require('validator');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String
    },
    emailId: {
        type: String,
        unique: true, // this is equivalet of index = true
        lowercase: true,
        required: true,
        trim: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: (props) => `${props.value} is not a valid email id.`
        }
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'others'],
            message: "`{VALUE}` is not a valid gender`"
        }
        // validate: {
        //     validator: function (value) {
        //         return ['male', 'female', 'others'].includes(value);
        //     },
        //     message: (props) => `${props.value} is not a valid gender.`
        // }
    },
    photoURL: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ53R9NdzEvh93WVjiUCx3ZKYtpAaAVCJh4Xg&s",
        validate: {
            validator: function (value) {
                return validator.isURL(value);
            },
            message: (props) => `${props.value} is not a valid URL.`
        }
    },
    skills: {
        type: [String]
    }
},
    { timestamps: true }
);

userSchema.methods.validateAndSignPassword = async function (userEnteredPass) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(userEnteredPass, user.password);
    if (isPasswordValid) {
        const token = await jwt.sign({ _id: user._id }, 'mySuperSecretToken@123');
        return token;
    } else {
        throw new Error('Invalid credentials');
    }
}

const User = mongoose.model('User', userSchema);

module.exports = User;