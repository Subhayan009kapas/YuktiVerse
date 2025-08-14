// server /notebooks  

import mongoose from 'mongoose';

const TextBoxSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  text: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  airesponse: {
    type: String,
    default: ''
  },
}, { _id: false });

const NotebookSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true  // if every note must be tied to a chapter
  },
  note_id: { 
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  important: {
    type: Boolean,
    default: false,
  },
  content: {
    textBoxes: [TextBoxSchema],
  },
}, { timestamps: true });

// const Notebook = mongoose.model('Notebook', NotebookSchema);
// export default Notebook;
export default mongoose.models.Notebook || mongoose.model('Notebook', NotebookSchema);
