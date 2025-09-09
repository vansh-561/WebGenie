import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true],
    },
    email: {
        type: String,
        required: [true],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/]
    },
    username: {
        type: String,
        required: [true],
        unique: true,
    },
    totalTokens: {
        type: Number,
        default: 1000
    },
    tokensToday: {
        type: Number,
        default: 0
    },
    last30DaysUsage: {
        type: [{
            date: {
                type: Date,
                required: true
            },
            tokens: {
                type: Number,
                default: 0
            }
        }],
        default: [{
            date: new Date(),
            tokens: 0
        }]
    },
    premium: {
        type: Boolean,
        default: false
    },
    projects: {
        type: [{
            total: {
                type: Number,
                default: 0
            },
            projectList: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Project',
                default: []
            }]
        }],
        default: [{
            total: 0,
            projectList: []
        }]
    },
    avatar: {
        type: String,
        default: 'https://placehold.co/40x40?text=U'
    },
    githubId: {
        type: String,
        default: ''
    },
    githubTokenEncrypted: {
        type: String,
        default: ''
    },
    githubTokenUpdatedAt: {
        type: Date,
        default: null
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!this.updatedAt || new Date(this.updatedAt) < startOfDay) {
        this.tokensToday = 0;
    }

    if (this.last30DaysUsage && this.last30DaysUsage.length > 30) {
        this.last30DaysUsage = this.last30DaysUsage.slice(-30);
    }

    next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
