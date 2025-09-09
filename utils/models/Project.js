import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true],
    },
    description: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    finalOutput: {
        type: String,
        default: ''
    },
    tokensUsed: {
        type: Number,
        default: 0
    },
    promptHistory: {
        type: [{
            role: {
                type: String,
                enum: ['user', 'assistant'],
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            model: {
                type: String,
                default: ''
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }],
        default: [],
    },
    acceptedPrompt: {
        type: String,
        default: '',
    },
    promptModel: {
        type: String,
        default: '',
    },
    stackRecommendations: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
    },
    selectedStack: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    projectBundle: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    repoUrl: {
        type: String,
        default: '',
    },
    deploymentDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    },
    projectRevisions: {
        type: [{
            revision: {
                type: Number,
                required: true,
            },
            generatedAt: {
                type: Date,
                default: Date.now,
            },
            model: {
                type: String,
                default: '',
            },
            stackSnapshot: {
                type: mongoose.Schema.Types.Mixed,
                default: null,
            },
            summary: {
                type: String,
                default: '',
            },
            tokensUsed: {
                type: Number,
                default: 0,
            },
            bundle: {
                type: mongoose.Schema.Types.Mixed,
                default: null,
            },
        }],
        default: [],
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project; 