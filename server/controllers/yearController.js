// controllers/yearController.js
import Year from '../models/Year.js';
import Subject from '../models/Subject.js';
import Chapter from '../models/Chapter.js';
// import Resource from '../models/Resource.js';
import Notebook from '../models/NoteBook.js';
import HandwrittenNote from '../models/HandwrittenNote.js';

//               User → Year → Subject → Chapter ← [ Notebook, HandwrittenNote ]

export const createYear = async (req, res) => {
  console.log("😅😅`", req.user);
  
  try {
    const { title, important } = req.body;
console.log(title , important , req.user.id );

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const year = new Year({
      title,
      important: important || false,
      user: req.user.id, // <-- secure way to link logged-in user
    });

    const savedYear = await year.save();
    res.status(201).json(savedYear);
  } catch (error) {
    console.error("Error creating year:", error);
    res.status(400).json({ message: error.message });
  }
};


export const listYears = async (req, res) => {
  console.log("😂😂😂 this is ",req.user);
  
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: No user info found' });
    }
        // console.log(req.user ," ", req.user._id);

    const years = await Year.find({ user: req.user.id }).lean();
console.log(years);

    if (!years || years.length === 0) {
      return res.status(404).json({ message: 'No years found for this user.' });
    }

    res.status(200).json(years);
  } catch (err) {
    console.error('❗ Error fetching years:', err.message || err);
    res.status(500).json({ error: 'Server error while fetching years' });
  }
};
export const toggleImportantYear = async (req, res) => {
  try {
    const { yearId } = req.params;
    const { important } = req.body;

    const year = await Year.findByIdAndUpdate(yearId, { important }, { new: true });

    if (!year) return res.status(404).json({ message: 'Year not found' });

    res.json(year);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to toggle year importance' });
  }
};

export const renameYear = async (req, res) => {
  try {
    const updated = await Year.findByIdAndUpdate(req.params.yearId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Year not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update year' });
  }
};

export const deleteYear = async (req, res) => {
  try {
    const { id } = req.params;

    // Find all subjects under this year
    const subjects = await Subject.find({ year: id });

    for (const subject of subjects) {
      // Find chapters under each subject
      const chapters = await Chapter.find({ subject: subject._id });

      for (const chapter of chapters) {
        // Delete materials under each chapter
        await Notebook.deleteMany({ chapter: chapter._id });
        await HandwrittenNote.deleteMany({ chapter: chapter._id });
      }

      // Delete the chapters
      await Chapter.deleteMany({ subject: subject._id });
    }

    // Delete the subjects
    await Subject.deleteMany({ year: id });

    // Finally, delete the year
    await Year.findByIdAndDelete(id);

    res.json({ message: 'Year and all nested data deleted successfully.' });
  } catch (err) {
    console.error('Error deleting year:', err);
    res.status(500).json({ error: 'Failed to delete year and its content.' });
  }
};



export const addSubject = async (req, res) => {
  const { yearId } = req.params;
  const { name, important = false } = req.body;

  try {
    const subject = new Subject({
      name,
      important,
      year: yearId
    });

    const saved = await subject.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const listSubjects = async (req, res) => {
  const { yearId } = req.params;

  try {
    const subjects = await Subject.find({ year: yearId }).lean();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const toggleImportantSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { important } = req.body;

    const subject = await Subject.findByIdAndUpdate(subjectId, { important }, { new: true });

    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    res.json(subject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to toggle subject importance' });
  }
};
 export const renameSubject = async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.subjectId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Subject not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update subject' });
  }
};
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const chapters = await Chapter.find({ subject: id });

    for (let chapter of chapters) {
      await Notebook.deleteMany({ chapter: chapter._id });
      await HandwrittenNote.deleteMany({ chapter: chapter._id });
    }

    await Chapter.deleteMany({ subject: id });
    await Subject.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete subject:", err);
    res.status(500).json({ error: 'Failed to delete subject and nested data' });
  }
};


export const addChapter = async (req, res) => {
  const { subjectId } = req.params;
  const { chapterTitle ,  important = false  } = req.body;

  if (!chapterTitle) return res.status(400).json({ error: 'chapterTitle is required' });

  try {
    const chapter = new Chapter({ title: chapterTitle, subject: subjectId });
    const saved = await chapter.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

 
export const listChapters = async (req, res) => {
  const { subjectId } = req.params;

  try {
    const chapters = await Chapter.find({ subject: subjectId }).lean();
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// PATCH 
export const updateChapterImportant = async (req, res) => {
  const { chapterId } = req.params;
  const { important } = req.body;

  try {
    const updated = await Chapter.findByIdAndUpdate(
      chapterId,
      { important },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating chapter:', err);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
};
export const renameChapter = async (req, res) => {
  try {
    const updated = await Chapter.findByIdAndUpdate(req.params.chapterId, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Chapter not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update chapter' });
  }
};
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;

    await Notebook.deleteMany({ chapter: id });
    await HandwrittenNote.deleteMany({ chapter: id });
    await Chapter.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete chapter:", err);
    res.status(500).json({ error: 'Failed to delete chapter and its materials' });
  }
};



 export const getMaterialsByChapter = async (req, res) => {
  const { chapterId } = req.params;

  try {
    const notebooks = await Notebook.find({ chapter: chapterId }).lean();
    const handwrittenNotes = await HandwrittenNote.find({ chapter: chapterId }).lean();

    res.status(200).json({
      notebooks,
      handwrittenNotes
    });
  } catch (err) {
    console.error('❌ Error fetching materials:', err);
    res.status(500).json({ error: 'Server error while fetching materials' });
  }
};

// export const addResource = async (req, res) => {
//   const { chapterId } = req.params;
//   const { kind, itemId } = req.body;

//   if (!kind || !itemId) {
//     return res.status(400).json({ error: 'kind and itemId are required' });
//   }

//   try {
//     const resource = new Resource({ kind, item: itemId, chapter: chapterId });
//     const saved = await resource.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

 
// export const listResources = async (req, res) => {
//   const { chapterId } = req.params;

//   try {
//     const resources = await Resource.find({ chapter: chapterId }).lean();
//     res.json(resources);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



 
