// controllers/codingContestController.js
import { getGeminiResponse } from '../utils/geminiClient.js';

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