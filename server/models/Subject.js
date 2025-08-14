// models/Subjects.js

import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const SubjectSchema = new mongoose.Schema({
  subject_id: {
    type: String,
    default: () => nanoid(10),
    unique: true
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Year',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  important: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Subject', SubjectSchema);

