import crypto from 'crypto';
import Notebook from '../models/NoteBook.js'; // Your notebook model
import HandwrittenNote from '../models/HandwrittenNote.js';
import SharedNotebook from '../models/SharedNotebook.js'; // New model for shared notebooks
import { title } from 'process';


export const generateShareLink = async (req, res) => {
  try {
    const { notebookId } = req.params;
    const { type } = req.body;
console.log(notebookId , type);

    const userId = req.user.id;
    let notebook;
    // Check if notebook exists and belongs to user
    if (type == 'handwritten') {
      notebook = await HandwrittenNote.findOne({
        _id: notebookId,
        user: userId
      });
    } else {
      notebook = await Notebook.findOne({
        _id: notebookId,
        user: userId
      });
    }
    console.log("note",notebook);

    if (!notebook) {
      return res.status(404).json({
        message: 'Notebook not found or you do not have permission'
      });
    }

    // Check if share link already exists
    let sharedNotebook = await SharedNotebook.findOne({
      notebookId: notebookId
    });


    console.log(sharedNotebook);
    if (sharedNotebook) {
      // console.log('note founud ' , sharedNotebook.isActive);

      // Update isActive to true if not already true
      if (sharedNotebook.isActive == false) {
        sharedNotebook.isActive = true;
        // sharedNotebook.revokedAt = null;
        await sharedNotebook.save();
      }
      return res.status(200).json({
        shareId: sharedNotebook.shareId,
        shareUrl: `${process.env.CLIENT_URL}/share/notebook/${sharedNotebook.shareId}`,
        createdAt: sharedNotebook.createdAt,
        isActive: true,
        title: notebook.title,
        type: notebook.fileType,
      });
    }

    // Generate unique share ID
    const shareId = crypto.randomBytes(16).toString('hex');

    // Create shared notebook record
    sharedNotebook = new SharedNotebook({
      shareId,
      notebookId,
      userId,
      type : notebook.fileType || 'notebook',
      title: notebook.title || notebook.name || 'Untitled',
      isActive: true,
      createdAt: new Date()
    });

    await sharedNotebook.save();

    res.status(201).json({
      shareId,
      shareUrl: `${process.env.CLIENT_URL}/share/notebook/${shareId}`,
      createdAt: sharedNotebook.createdAt,
      isActive: true,
      title: notebook.title,
      type: notebook.fileType,
    });

  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({ message: 'Failed to generate share link' });
  }
}


// Revoke share link
export const revokeShareLink = async (req, res) => {
  try {
    const { shareId, userId } = req.params;
    // const userId = req.user.id;
    // console.log("rmeove" , shareId , userId);

    const sharedNotebook = await SharedNotebook.findOne({
      shareId,
      userId
    });
    console.log(sharedNotebook);

    if (!sharedNotebook) {
      return res.status(404).json({
        message: 'Share link not found or you do not have permission'
      });
    }

    // Soft delete - mark as inactive
    sharedNotebook.isActive = false;
    sharedNotebook.revokedAt = new Date();
    await sharedNotebook.save();

    res.status(200).json({
      message: 'Share link revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking share link:', error);
    res.status(500).json({ message: 'Failed to revoke share link' });
  }
}

// Get all shared notebooks by user
import mongoose from "mongoose";

export const getUserSharedNotebooks = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required in URL params" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const sharedNotebooks = await SharedNotebook.find({
      userId,
      isActive: true,
    });

    const formattedShares = sharedNotebooks.map((share) => ({
      shareId: share.shareId,
      shareUrl: `${process.env.CLIENT_URL}/share/notebook/${share.shareId}`,
      isActive: share.isActive,
      notebook: share.notebookId,
      createdAt: share.createdAt,
      viewCount: share.viewCount,
      title: share.title,
      type: share.type,
      lastViewedAt: share.lastViewedAt,
    }));

    res.status(200).json(formattedShares);
  } catch (error) {
    console.error("Error fetching user shared notebooks:", error);
    res.status(500).json({ message: "Failed to fetch shared notebooks" });
  }
};



// public access  ✨
// Get shared notebook (public route)
export const getSharedNotebook = async (req, res) => {
  try {
    const { shareId } = req.params;
// console.log("shareID",shareId);

    // Find shared notebook
    const sharedNotebook = await SharedNotebook.findOne({
      shareId,
      isActive: true
    });
// console.log(sharedNotebook);

    if (!sharedNotebook) {
      return res.status(404).json({
        message: 'Shared notebook not found or has been disabled'
      });
    }
    // Get the actual notebook
    // console.log("note di ", sharedNotebook.notebookId);
    
    let notebook;
    if (sharedNotebook.type === 'notebook') {
      notebook = await Notebook.findById(sharedNotebook.notebookId)
        .select('name content createdAt updatedAt'); // Only select needed fields

        // console.log("inside " , notebook);
        
    } else {
        notebook = await HandwrittenNote.findById(sharedNotebook.notebookId)
        .select('title fileType fileUrl createdAt updatedAt');
    } 
    // console.log(notebook);

    if (!notebook) {
      return res.status(404).json({
        message: 'Original notebook not found'
      });
    }

    // Update view count (optional)
    await SharedNotebook.updateOne(
      { _id: sharedNotebook._id },
      {
        $inc: { viewCount: 1 },
        lastViewedAt: new Date()
      }
    );

    if (sharedNotebook.type == 'notebook') {
      res.status(200).json({
        name: notebook.name,
        userId: sharedNotebook.userId,
        content: notebook.content,
        sharedAt: sharedNotebook.createdAt,
        updatedAt: notebook.updatedAt,
        viewCount: sharedNotebook.viewCount + 1
      });
      
    } else {
      res.status(200).json({
        title: notebook.title,
        type: notebook.fileType,
        userId: sharedNotebook.userId,
        fileUrl: notebook.fileUrl,
        sharedAt: sharedNotebook.createdAt,
        updatedAt: notebook.updatedAt,
        viewCount: sharedNotebook.viewCount + 1
      });
    }

  } catch (error) {
    console.error('Error fetching shared notebook:', error);
    res.status(500).json({ message: 'Failed to load shared notebook' });
  }
}