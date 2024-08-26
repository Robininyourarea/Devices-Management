import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    id: { type: Number, unique: true, required: true }, 
    name: { type: String, default: null },
    type: { type: String, default: null },
    location: { type: String, default: null },
    status: { type: String, default: null },
});

const Device = mongoose.models.Device || mongoose.model('Device', deviceSchema);

export default Device;