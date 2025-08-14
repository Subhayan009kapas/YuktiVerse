// controllers/handwrittenNoteController.js


import HandwrittenNote from '../models/HandwrittenNote.js';
import path from 'path';
import { uploadOnCloudinary } from '../middlewares/Cloudinary.js';
import { v2 as cloudinary } from 'cloudinary';

// Upload a handwritten note
export const uploadNote = async (req, res) => {
  console.log("coming to the upload thing ");
  
  try {
    const { chapter, title } = req.body;
    if (!req.file) return res.status(400).json({ error: 'File is required' });


 // Local disk path from multer
    const localPath = req.file.path;

    // 1) Upload to Cloudinary
    const uploadResult = await uploadOnCloudinary(localPath);
    if (!uploadResult) {
      return res.status(500).json({ error: 'Cloudinary upload failed' });
    }

    // 2) Prepare note fields
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';
    const fileUrl  = uploadResult.secure_url;
    const public_id  = uploadResult.public_id;
    const important = false ; 

    console.log(chapter , title , fileType , fileUrl , public_id , important);
    const note = await HandwrittenNote.create({
      user: req.user.id,
      chapter,
      title,
      fileType,
      fileUrl,
      important, 
      public_id  
    });
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload note' });
  }
};

// emnio ei fuunction ta lagbe bole mone hoina , kaorn eta pore ekabre chapter diye list kore ana hobe notebook ermotoi 
export const getHandWrittenNotes = async (req, res) => {
  console.log("get hand notes");
  
  try {
    const { chapter } = req.query;

    if (!chapter) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }

    const notes = await HandwrittenNote.find({
      user: req.user._id,
      chapter,
    }).sort({ createdAt: -1 });
// console.log(notes);

    res.json(notes);
  } catch (err) {
    console.error('Error fetching handwritten notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};


export const renameNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    // console.log(" this is note id ",noteId);
    const _id = noteId ; 
    const { title } = req.body;
    // const user = req.user.id;
    const updated = await HandwrittenNote.findByIdAndUpdate( _id, { title }, { new: true });
    // console.log(updated);
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename handwritten note' });
  }
};

export const toggleImportantNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    // console.log(noteId);
    const _id = noteId 
    // const user = req.user.id;
    // console.log("this is user ",user);
    
    const note = await HandwrittenNote.findById( _id);
    // console.log(note);
    
    note.important = !note.important;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle important status' });
  }
};

// controllers/handwrittenController.js
export const deleteHandwrittenNote = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const note = await HandwrittenNote.findById(id);
    
    if (!note) return res.status(404).json({ error: "Note not found" });

    // 1. Delete file from Cloudinary
    if (note.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(note.cloudinaryPublicId);
    }

    // 2. Delete from DB
    await note.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting handwritten note:", err);
    res.status(500).json({ error: "Failed to delete handwritten note" });
  }
};