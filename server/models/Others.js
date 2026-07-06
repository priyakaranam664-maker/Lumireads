const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        subtitle: String,
        image: { type: String, required: true },
        link: String,
        position: { type: String, enum: ['hero', 'promo', 'sidebar', 'footer'], default: 'hero' },
        sortOrder: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        startDate: Date,
        endDate: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);

// --- Contact Message Model ---
const contactSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: String,
        subject: { type: String, required: true },
        message: { type: String, required: true },
        status: { type: String, enum: ['new', 'read', 'replied', 'closed'], default: 'new' },
        reply: String,
    },
    { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);

// --- Settings Model ---
const settingsSchema = new mongoose.Schema(
    {
        key: { type: String, required: true, unique: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
        group: { type: String, default: 'general' },
    },
    { timestamps: true }
);

const Settings = mongoose.model('Settings', settingsSchema);

// --- Activity Log Model ---
const activityLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, required: true },
        entity: String,
        entityId: mongoose.Schema.Types.ObjectId,
        details: String,
        ip: String,
    },
    { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { Banner: mongoose.model('Banner'), Contact, Settings, ActivityLog };
