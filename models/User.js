const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name : {
        type : String,
        maxlength : 50,
    },
    email : {
        type : String,
        trim : true,
        unique : 1
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024
    },
    lastname : {
        type : String,
        maxlength : 50
    },
    role : {
        type : Number,
        default : 0
    },
    image : String,
    token : {
        type : String,
    },
    tokenExp : {
        type : Number,
    }
});

userSchema.pre('save', function(next) {
    var user = this;

    if (user.isModified('password')) {
        // 비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err) return next(err)

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err)

                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
})

userSchema.methods.comparePassword = function (plainPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainPassword, this.password, (err, isMatched) => {
            if (err) return reject(err);
            resolve(isMatched);
        });
    });
};


userSchema.methods.genToken = function () {
    const user = this;

    return new Promise((resolve, reject) => {
        const token = jwt.sign(user._id.toHexString(), 'secretToken');
        user.token = token;

        user.save()
            .then((savedUser) => resolve(savedUser))
            .catch((err) => reject(err));
    });
};

userSchema.statics.findByToken = async function (token) {
    var user = this;

    try {
        const decoded = jwt.verify(token, 'secretToken');
        const foundUser = await user.findOne({ _id : decoded, token : token });
        return foundUser;
    } catch (err) {
        throw err
    }
}


const User = mongoose.model('User', userSchema);

module.exports = { User };