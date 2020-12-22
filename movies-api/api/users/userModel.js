import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const Schema = mongoose.Schema;


const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favourites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movies'}]
});

UserSchema.path('password').validate((value) => {
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/
    return re.test(value)
}, 'password is invalid')

UserSchema.statics.findByUserName = function (username) {
    return this.findOne({
        username: username
    });
};

UserSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

UserSchema.pre('save', function(next) {
    const user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, (err, salt)=> {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, null, (err, hash)=> {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

export default mongoose.model('User', UserSchema);