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
    const { topic, difficulty } = req.body;

    if (!topic || !difficulty) {
      return res.status(400).json({ error: "Topic and difficulty are required" });
    }

    // Generate random elements for variety
    const { style, context, variation } = getRandomElements();
    const topicVariation = getTopicVariations(topic);
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);

    // Enhanced prompt with test cases like LeetCode
    const prompt = `
You are a coding question generator AI similar to LeetCode. Create a UNIQUE and ORIGINAL coding question with multiple test cases.

Topic: ${topic}
Difficulty: ${difficulty}
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

RESPONSE FORMAT (exactly as shown):

Problem Title:
[Creative title for the problem]

Problem Description:
[Write a clear, detailed problem statement that involves ${topic} and ${topicVariation}]

Function Signature:
[Provide the function signature like: def solution(nums): or function solution(nums) { ]

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
      metadata: {
        topic,
        difficulty,
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
    const { code, question } = req.body;

    if (!code || !question) {
      return res.status(400).json({ error: "Code and question are required" });
    }

    // Enhanced verification prompt for test cases
    const prompt = `
You are an expert code evaluator AI like LeetCode's judge system. Analyze the student's code against the given problem with test cases.

Original Question:
${question}

Student's Code:
${code}

EVALUATION PROCESS:
1. Extract both test cases (Example 1 and Example 2) from the question
2. Simulate running the code on both test cases
3. Check if the logic handles both scenarios correctly
4. Provide individual results for each test case
5.Check the Syntax of code according to the coding Language

RESPONSE FORMAT (EXACTLY as shown):
Test Case 1: [PASSED/FAILED] - [Brief reason]
Test Case 2: [PASSED/FAILED] - [Brief reason]
Overall Result: [ACCEPTED/WRONG ANSWER/RUNTIME ERROR] - [Overall assessment]

Rules:
- If both test cases pass: "ACCEPTED"
- If any test case fails: "WRONG ANSWER"  
- If code has syntax/logic errors: "RUNTIME ERROR"
- Keep explanations brief and specific

Provide only the evaluation result in the specified format, nothing else.`;
    
    const result = await getGeminiResponse(prompt);

    res.json({ 
      result: result.trim(),
      evaluatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Code Verification Error:", error.message);
    res.status(500).json({ error: "Failed to verify code" });
  }
};