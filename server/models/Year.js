// models/Year.js
import mongoose from 'mongoose';
import SubjectSchema from './Subject.js';

const { Schema } = mongoose;

const YearSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  important: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

export default mongoose.model('Year', YearSchema);
