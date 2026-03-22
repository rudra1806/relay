import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster email lookups
userSchema.index({ email: 1 });

// Method to exclude password when converting to JSON
// This method is called when the user document is converted to JSON (e.g., when sending a response). It removes the password field from the output, ensuring that sensitive information is not exposed in API responses.
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User;