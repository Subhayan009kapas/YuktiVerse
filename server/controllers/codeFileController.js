import CodeFile from '../models/CodeFile.js';
import mongoose from 'mongoose';

import { getGeminiResponse } from '../utils/geminiClient.js';

const ALLOWED_LANGUAGES = [
  'javascript','python','java','cpp','c','html','css',
  'react','typescript','php','ruby','go','rust','kotlin',
  'swift','sql','json','xml','markdown','other'
];

// Create a new code file
export const createCodeFile = async (req, res) => {
  try {
    const {
      title,
      content,
      prog_language,
      description,
      tags
    } = req.body;

    // Use req.user.id as you requested
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing authenticated user id (req.user.id).'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id.'
      });
    }

    // Normalize and validate prog_language
    const lang = (prog_language || 'javascript').toString().toLowerCase();
    if (!ALLOWED_LANGUAGES.includes(lang)) {
      return res.status(400).json({
        success: false,
        message: `Invalid prog_language. Allowed values: ${ALLOWED_LANGUAGES.join(', ')}`
      });
    }

    // Normalize tags: accept array or comma-separated string
    let tagsArr = [];
    if (Array.isArray(tags)) {
      tagsArr = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      tagsArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const codeFile = new CodeFile({
      title: title?.trim() || 'Untitled Code File',
      content: content ?? '',
      prog_language: lang,
      description: description?.trim() || '',
      tags: tagsArr,
      userId
    });

    await codeFile.save();

    return res.status(201).json({
      success: true,
      message: 'Code file created successfully',
      data: codeFile
    });
  } catch (error) {
    console.error('Error creating code file:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create code file',
      error: error.message
    });
  }
};
// Get all code files for user
export const getAllCodeFiles = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(req.user.id);
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing user id in request body (req.body.id).'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user id.'
      });
    }

    // Find all files for the given userId
    const codeFiles = await CodeFile.find({ userId }).select('-__v');  

    return res.json({
      success: true,
      data: codeFiles
    });
  } catch (error) {
    console.error('Error fetching code files:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch code files',
      error: error.message
    });
  }
};

// Get single code file by ID
export const getCodeFileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code file ID'
      });
    }

    const codeFile = await CodeFile.findOne({
      _id: id,
      userId: req.user._id
    }).populate('collaborators.userId', 'name email');

    if (!codeFile) {
      return res.status(404).json({
        success: false,
        message: 'Code file not found'
      });
    }

    res.json({
      success: true,
      data: codeFile
    });
  } catch (error) {
    console.error('Error fetching code file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch code file',
      error: error.message
    });
  }
};

// Update code file
export const updateCodeFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, description, prog_language, tags, important, isShared } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code file ID",
      });
    }

    // Build update object dynamically
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (description !== undefined) updateData.description = description;
    if (prog_language !== undefined) updateData.prog_language = prog_language;
    if (tags !== undefined) updateData.tags = tags;
    if (important !== undefined) updateData.important = important;
    if (isShared !== undefined) updateData.isShared = isShared;

    // Update file only if owned by current user
    const codeFile = await CodeFile.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // ✅ use req.user.id
      updateData,
      { new: true, runValidators: true }
    ); 

    if (!codeFile) {
      return res.status(404).json({
        success: false,
        message: "Code file not found or not owned by this user",
      });
    }

    return res.json({
      success: true,
      message: "Code file updated successfully",
      data: codeFile,
    });
  } catch (error) {
    console.error("Error updating code file:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update code file",
      error: error.message,
    });
  }
};

// Delete code file
export const deleteCodeFile = async (req, res) => {
  try {
    const { fileId } = req.params;
console.log(fileId);

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code file ID'
      });
    }

    const codeFile = await CodeFile.findOneAndDelete({
      _id: fileId,
      userId: req.user.id
    });

    if (!codeFile) {
      return res.status(404).json({
        success: false,
        message: 'Code file not found'
      });
    }

    res.json({
      success: true,
      message: 'Code file deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting code file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete code file',
      error: error.message
    });
  }
};


// controllers/codeController.js
export const runCode = async (req, res) => {
  try {
    const { code, language = 'javascript', question } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    // You can reuse your existing verifyCode logic or create a simpler version
    const prompt = `
Execute and analyze this ${language} code:

Code:
${code}

${question ? `Context: ${question}` : ''}

Provide the output in this format:
Execution Status: [SUCCESS/ERROR]
Output: [actual output or error message]
Execution Time: [estimated time]
Memory Usage: [estimated memory]

Be concise and clear.`;
    
    const result = await getGeminiResponse(prompt);

    res.json({ 
      result: result.trim(),
      language,
      executedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Code Execution Error:", error.message);
    res.status(500).json({ error: "Failed to execute code" });
  }
};


// Rename code file
export const renameCodeFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code file ID'
      });
    }

    const codeFile = await CodeFile.findOneAndUpdate(
      { _id: fileId, userId: req.user.id },
      { title: title.trim() },
      { new: true, runValidators: true }
    );

    if (!codeFile) {
      return res.status(404).json({
        success: false,
        message: 'Code file not found'
      });
    }

    res.json({
      success: true,
      message: 'Code file renamed successfully',
      data: { title: codeFile.title }
    });
  } catch (error) {
    console.error('Error renaming code file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rename code file',
      error: error.message
    });
  }
};

// Toggle important status
export const toggleImportant = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code file ID'
      });
    }

    const codeFile = await CodeFile.findOne({
      _id: fileId,
      userId: req.user.id
    });

    if (!codeFile) {
      return res.status(404).json({
        success: false,
        message: 'Code file not found'
      });
    }

    codeFile.important = !codeFile.important;
    await codeFile.save();

    res.json({
      success: true,
      message: `Code file ${codeFile.important ? 'marked as' : 'removed from'} important`,
      data: { important: codeFile.important }
    });
  } catch (error) {
    console.error('Error toggling important status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle important status',
      error: error.message
    });
  }
};

// Share code file
export const shareCodeFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code file ID'
      });
    }

    const codeFile = await CodeFile.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!codeFile) {
      return res.status(404).json({
        success: false,
        message: 'Code file not found'
      });
    }

    if (codeFile.isShared) {
      return res.json({
        success: true,
        message: 'Code file is already shared',
        data: { shareUrl: `${process.env.FRONTEND_URL}/shared/${codeFile.shareUrl}` }
      });
    }

    const shareToken = codeFile.generateShareUrl();
    await codeFile.save();

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareToken}`;

    res.json({
      success: true,
      message: 'Code file shared successfully',
      data: { shareUrl }
    });
  } catch (error) {
    console.error('Error sharing code file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share code file',
      error: error.message
    });
  }
};

// Get shared code file (public route)
export const getSharedCodeFile = async (req, res) => {
  try {
    const { shareUrl } = req.params;

    const codeFile = await CodeFile.findOne({ 
      shareUrl, 
      isShared: true 
    })
    .populate('userId', 'name')
    .select('-collaborators');

    if (!codeFile) {
      return res.status(404).json({
        success: false,
        message: 'Shared code file not found'
      });
    }

    // Increment view count
    codeFile.viewCount += 1;
    await codeFile.save();

    res.json({
      success: true,
      data: codeFile
    });
  } catch (error) {
    console.error('Error fetching shared code file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared code file',
      error: error.message
    });
  }
};

// Fork code file
export const forkCodeFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code file ID'
      });
    }

    const originalFile = await CodeFile.findById(id);

    if (!originalFile) {
      return res.status(404).json({
        success: false,
        message: 'Code file not found'
      });
    }

    // Check if user can access this file (own file or shared)
    if (originalFile.userId.toString() !== req.user._id.toString() && !originalFile.isShared) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const forkedFile = new CodeFile({
      title: `${originalFile.title} (Fork)`,
      content: originalFile.content,
      prog_language: originalFile.prog_language,
      description: originalFile.description,
      tags: [...originalFile.tags],
      userId: req.user._id,
      forkOf: originalFile._id
    });

    await forkedFile.save();

    // Increment fork count
    originalFile.forkCount += 1;
    await originalFile.save();

    res.status(201).json({
      success: true,
      message: 'Code file forked successfully',
      data: forkedFile
    });
  } catch (error) {
    console.error('Error forking code file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fork code file',
      error: error.message
    });
  }
};

// Search code files
export const searchCodeFiles = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchQuery = {
      userId: req.user._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { content: { $regex: query, $options: 'i' } }
      ]
    };

    const skip = (page - 1) * limit;
    
    const [codeFiles, total] = await Promise.all([
      CodeFile.find(searchQuery)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content'),
      CodeFile.countDocuments(searchQuery)
    ]);

    res.json({
      success: true,
      data: {
        codeFiles,
        query,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Error searching code files:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};





// Helper function to generate random elements for variety
const getRandomElements = () => {
  const questionStyles = [
    "Create a function that",
    "Write a program to",
    "Implement an algorithm that",
    "Design a solution that",
    "Build a function to"
  ];
  
  const contexts = [
    "for a tech company interview",
    "for competitive programming",
    "for algorithm practice",
    "for coding assessment",
    "for software development"
  ];
  
  const variations = [
    "with optimal time complexity",
    "using different approaches",
    "considering edge cases",
    "with memory efficiency",
    "with clean code practices"
  ];
  
  return {
    style: questionStyles[Math.floor(Math.random() * questionStyles.length)],
    context: contexts[Math.floor(Math.random() * contexts.length)],
    variation: variations[Math.floor(Math.random() * variations.length)]
  };
};

// Helper function to get topic-specific sub-areas
const getTopicVariations = (topic) => {
  const topicMap = {
    'array': ['sorting', 'searching', 'two pointers', 'sliding window', 'prefix sum', 'subarray problems'],
    'string': ['pattern matching', 'palindromes', 'anagrams', 'substring problems', 'string manipulation'],
    'linked list': ['traversal', 'reversal', 'cycle detection', 'merging', 'sorting'],
    'tree': ['traversal', 'binary search tree', 'height calculation', 'path problems', 'serialization'],
    'graph': ['BFS', 'DFS', 'shortest path', 'cycle detection', 'topological sort'],
    'dynamic programming': ['1D DP', '2D DP', 'knapsack', 'longest subsequence', 'optimization'],
    'stack': ['parentheses matching', 'next greater element', 'monotonic stack', 'expression evaluation'],
    'queue': ['level order traversal', 'sliding window maximum', 'circular queue', 'priority queue'],
    'heap': ['min heap', 'max heap', 'k largest elements', 'merge k sorted', 'heap sort'],
    'sorting': ['merge sort', 'quick sort', 'counting sort', 'custom comparator', 'stable sorting'],
    'searching': ['binary search', 'linear search', 'search in rotated array', 'first/last occurrence'],
    'recursion': ['backtracking', 'divide and conquer', 'tree recursion', 'memoization']
  };
  
  const variations = topicMap[topic.toLowerCase()] || ['basic operations', 'advanced techniques', 'optimization'];
  return variations[Math.floor(Math.random() * variations.length)];
};





export const generateCodingQuestion = async (req, res) => {
  
  try {
    const { topic, difficulty, language = 'javascript' } = req.body;


    if (!topic || !difficulty) {
      return res.status(400).json({ error: "Topic and difficulty are required" });
    }

    // Generate random elements for variety
    const { style, context, variation } = getRandomElements();
    const topicVariation = getTopicVariations(topic);
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);

    // Language-specific function signature templates
    const languageTemplates = {
      javascript: "function solution(params) {\n    // Your code here\n    return result;\n}",
      python: "def solution(params):\n    # Your code here\n    return result",
      java: "public class Solution {\n    public ReturnType solution(ParamType params) {\n        // Your code here\n        return result;\n    }\n}",
      cpp: "#include <vector>\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    ReturnType solution(ParamType params) {\n        // Your code here\n        return result;\n    }\n};",
      c: "#include <stdio.h>\n#include <stdlib.h>\n\nReturnType solution(ParamType params) {\n    // Your code here\n    return result;\n}"
    };

    // Enhanced prompt with test cases and language-specific requirements
    const prompt = `
You are a coding question generator AI similar to LeetCode. Create a UNIQUE and ORIGINAL coding question with multiple test cases for ${language}.

Topic: ${topic}
Difficulty: ${difficulty}
Programming Language: ${language}
Focus Area: ${topicVariation}
Question Style: ${style}
Context: ${context}
Requirement: ${variation}
Random Seed: ${randomSeed}
Timestamp: ${timestamp}

STRICT REQUIREMENTS:
1. Generate a COMPLETELY NEW and UNIQUE question every time
2. DO NOT repeat common problems like "Two Sum", "Reverse Array", etc.
3. Make the question creative and interesting
4. The question should be ${difficulty} level difficulty
5. MUST include exactly 2 test cases with different scenarios
6. Provide proper function signature for ${language}

RESPONSE FORMAT (exactly as shown):

Problem Title:
[Creative title for the problem]

Problem Description:
[Write a clear, detailed problem statement that involves ${topic} and ${topicVariation}]

Function Signature (${language}):
${languageTemplates[language] || languageTemplates.javascript}

Example 1:
Input: [specific input]
Output: [expected output]
Explanation: [brief explanation of why this output is correct]

Example 2:
Input: [different input scenario]
Output: [expected output]
Explanation: [brief explanation of why this output is correct]

Constraints:
[List constraints like array size, value ranges, etc.]

IMPORTANT: Make this question unique, creative, and include 2 diverse test cases that test different scenarios!
`;

    const questionText = await getGeminiResponse(prompt);

    res.json({
      question: questionText,
      language,
      template: languageTemplates[language] || languageTemplates.javascript,
      metadata: {
        topic,
        difficulty,
        language,
        topicVariation,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Coding Question Generation Error:", error.message);
    res.status(500).json({ error: "Failed to generate coding question" });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { code, question, language = 'javascript' } = req.body;

    if (!code || !question) {
      return res.status(400).json({ error: "Code and question are required" });
    }

    // Enhanced verification prompt with syntax checking
    const prompt = `
You are an expert code evaluator AI like LeetCode's judge system with advanced syntax checking capabilities. Analyze the student's ${language} code against the given problem with comprehensive error detection.

Original Question:
${question}

Student's Code (${language}):
${code}

EVALUATION PROCESS:
1. FIRST: Check for syntax errors in ${language}:
   - Missing semicolons, brackets, parentheses
   - Invalid variable declarations
   - Incorrect function syntax
   - Type mismatches (for typed languages)
   - Indentation issues (for Python)
   - Any compilation/parsing errors

2. IF NO SYNTAX ERRORS: Extract both test cases (Example 1 and Example 2) from the question
3. Simulate running the code on both test cases
4. Check if the logic handles both scenarios correctly

RESPONSE FORMAT (EXACTLY as shown):

Syntax Check: [PASSED/FAILED] - [Brief description of syntax issues if any]
Test Case 1: [PASSED/FAILED/SKIPPED] - [Brief reason]
Test Case 2: [PASSED/FAILED/SKIPPED] - [Brief reason]
Overall Result: [ACCEPTED/WRONG ANSWER/COMPILATION ERROR/RUNTIME ERROR] - [Overall assessment]

RULES:
- If syntax errors found: "COMPILATION ERROR", skip test cases (mark as SKIPPED)
- If syntax is correct but logic fails: "WRONG ANSWER"
- If both syntax and logic are correct: "ACCEPTED"
- If code runs but crashes: "RUNTIME ERROR"
- For ${language}, check language-specific syntax rules strictly
- Be very strict about syntax - even missing semicolons should be caught

Provide only the evaluation result in the specified format, nothing else.`;
    
    const result = await getGeminiResponse(prompt);

    res.json({ 
      result: result.trim(),
      language,
      evaluatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Code Verification Error:", error.message);
    res.status(500).json({ error: "Failed to verify code" });
  }
};