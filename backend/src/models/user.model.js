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
    },
    profilePic: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true // Index for efficient queries on unverified users
    },
    otp: {
        type: String,
        select: false // Don't include OTP in queries by default for security
    },
    otpExpiry: {
        type: Date,
        select: false, // Don't include OTP expiry in queries by default
        index: true // Index for efficient cleanup queries
    },
    lastOTPSentAt: {
        type: Date,
        select: false // Track when OTP was last sent for accurate rate limiting
    },
    resetPasswordOTP: {
        type: String,
        select: false // OTP for password reset
    },
    resetPasswordOTPExpiry: {
        type: Date,
        select: false // Expiry time for reset password OTP
    },
    lastResetOTPSentAt: {
        type: Date,
        select: false // Track when reset OTP was last sent for rate limiting
    },
    contacts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
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