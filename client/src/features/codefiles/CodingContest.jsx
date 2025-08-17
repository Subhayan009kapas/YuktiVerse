import { useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";

export default function CodingContest() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [language, setLanguage] = useState("javascript");
  const [question, setQuestion] = useState(null);
  const [questionMetadata, setQuestionMetadata] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Language templates
  const languageTemplates = {
    javascript: `function solution(params) {
    // Your code here
    return result;
}`,
    python: `def solution(params):
    # Your code here
    return result`,
    java: `public class Solution {
    public ReturnType solution(ParamType params) {
        // Your code here
        return result;
    }
}`,
    cpp: `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    ReturnType solution(ParamType params) {
        // Your code here
        return result;
    }
};`,
    c: `#include <stdio.h>
#include <stdlib.h>

ReturnType solution(ParamType params) {
    // Your code here
    return result;
}`
  };

  const languageInfo = {
    javascript: { name: "JavaScript", icon: "JS", extension: ".js" },
    python: { name: "Python", icon: "PY", extension: ".py" },
    java: { name: "Java", icon: "JA", extension: ".java" },
    cpp: { name: "C++", icon: "C++", extension: ".cpp" },
    c: { name: "C", icon: "C", extension: ".c" }
  };

  // Generate coding question
  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      alert("Please enter a topic!");
      return;
    }

    setLoading(true);
    setResult("");
    setCode("");
    setQuestion(null);
    setQuestionMetadata(null);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/codefiles/coding",
        { topic: topic.trim(), difficulty, language },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setQuestion(res.data.question);
      setQuestionMetadata(res.data.metadata);
      // Set the template code for the selected language
      setCode(res.data.template || languageTemplates[language]);
    } catch (err) {
      console.error("Generation Error:", err.response?.data || err.message);
      alert("Failed to generate question. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [topic, difficulty, language]);

  // Verify code with enhanced syntax checking
  const handleVerify = useCallback(async () => {
    if (!code.trim()) {
      alert("Please write some code before verifying!");
      return;
    }

    if (!question) {
      alert("Please generate a question first!");
      return;
    }

    setVerifying(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/codefiles/verify-code",
        {
          code: code.trim(),
          question: question,
          language: language
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResult(res.data.result);
      setExpanded(true);
    } catch (err) {
      console.error("Verification Error:", err.response?.data || err.message);
      alert("Failed to verify code. Please try again.");
    } finally {
      setVerifying(false);
    }
  }, [code, question, language]);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    // If we have a template or existing code, update it
    if (!code || code === languageTemplates[language]) {
      setCode(languageTemplates[newLanguage]);
    }
  };

  // Parse result for better display with syntax check
  const parsedResult = useMemo(() => {
    if (!result) return null;

    const lines = result.split("\n");
    const syntaxCheck = lines.find((line) => line.includes("Syntax Check:")) || "";
    const testCases = lines.filter((line) => line.includes("Test Case"));
    const overallResult = lines.find((line) => line.includes("Overall Result:")) || "";

    return {
      syntaxCheck: {
        text: syntaxCheck,
        passed: syntaxCheck.includes("PASSED")
      },
      testCases: testCases.map((line, index) => ({
        id: index + 1,
        text: line,
        passed: line.includes("PASSED"),
        skipped: line.includes("SKIPPED")
      })),
      overallResult,
      status: overallResult.includes("ACCEPTED")
        ? "accepted"
        : overallResult.includes("COMPILATION ERROR")
        ? "compilation-error"
        : overallResult.includes("RUNTIME ERROR")
        ? "runtime-error"
        : "wrong",
    };
  }, [result]);

  const toggleResultPanel = () => {
    setExpanded(!expanded);
  };

  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-background)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-mono)",
        padding: "20px 20px 20px 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* CyberNeon background effects */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
          radial-gradient(circle at 15% 30%, rgba(0, 255, 255, 0.05) 0%, transparent 20%),
          radial-gradient(circle at 85% 70%, rgba(255, 0, 255, 0.05) 0%, transparent 20%),
          var(--color-background)
        `,
          zIndex: -1,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "var(--header-bg)",
          boxShadow: "var(--shadow-primary)",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--color-border-primary)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "var(--gradient-accent)",
          }}
        />

        <h1
          style={{
            textAlign: "center",
            margin: "0 0 20px 0",
            background: "var(--gradient-accent)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "2.2rem",
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          Yuktiverse Coding Contest 
        </h1>

        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
            <input
              type="text"
              placeholder="Enter Topic (e.g., arrays, strings, trees)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                padding: "14px 14px 14px 42px",
                width: "100%",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-primary)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "15px",
                transition: "all 0.3s ease",
              }}
            />
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                padding: "14px 40px 14px 16px",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-primary)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "15px",
                appearance: "none",
                cursor: "pointer",
                minWidth: "120px",
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <span
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          {/* Language Selector */}
          <div style={{ position: "relative" }}>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              style={{
                padding: "14px 40px 14px 16px",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-primary)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "15px",
                appearance: "none",
                cursor: "pointer",
                minWidth: "140px",
              }}
            >
              {Object.entries(languageInfo).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              padding: "14px 32px",
              background: loading
                ? "var(--color-surface)"
                : "var(--gradient-accent)",
              color: loading ? "var(--text-secondary)" : "var(--text-dark)",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "bold",
              boxShadow: "var(--shadow-button)",
              transition: "all 0.3s ease",
              position: "relative",
              overflow: "hidden",
              minWidth: "180px",
            }}
          >
            {loading ? (
              <>
                <span style={{ position: "relative", zIndex: 2 }}>
                  Generating...
                </span>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "var(--popup-shimmer)",
                    animation: "shimmer 1.5s infinite",
                    zIndex: 1,
                  }}
                />
              </>
            ) : (
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Generate Question
              </span>
            )}
          </button>
        </div>
      </div>

      {question ? (
        <div
          style={{
            display: "flex",
            gap: "20px",
            height: "calc(100vh - 220px)",
            minHeight: "500px",
          }}
        >
          {/* Question Panel */}
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--color-surface)",
              borderRadius: "12px",
              border: "1px solid var(--color-border-primary)",
              overflow: "hidden",
              boxShadow: "var(--shadow-primary)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--header-bg)",
                borderBottom: "1px solid var(--color-border-primary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12H15M9 8H15M9 16H12M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Problem Statement
              </h2>
              {questionMetadata && (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "rgba(var(--accent-primary-rgb), 0.1)",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      border: "1px solid var(--border-accent)",
                    }}
                  >
                    {questionMetadata.topic}
                  </span>
                  <span
                    style={{
                      backgroundColor:
                        difficulty === "easy"
                          ? "rgba(var(--success-rgb), 0.1)"
                          : difficulty === "medium"
                          ? "rgba(var(--color-accent-highlight), 0.1)"
                          : "rgba(var(--danger-rgb), 0.1)",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      border:
                        difficulty === "easy"
                          ? "1px solid var(--success)"
                          : difficulty === "medium"
                          ? "1px solid var(--color-accent-highlight)"
                          : "1px solid var(--danger)",
                      color:
                        difficulty === "easy"
                          ? "var(--success)"
                          : difficulty === "medium"
                          ? "var(--color-accent-highlight)"
                          : "var(--danger)",
                    }}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                  <span
                    style={{
                      backgroundColor: "rgba(var(--accent-primary-rgb), 0.1)",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      border: "1px solid var(--border-accent)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: "bold",
                        padding: "2px 4px",
                        backgroundColor: "var(--accent-primary)",
                        color: "var(--text-dark)",
                        borderRadius: "4px",
                      }}
                    >
                      {languageInfo[language].icon}
                    </span>
                    {languageInfo[language].name}
                  </span>
                </div>
              )}
            </div>

            <div
              style={{
                padding: "20px",
                overflowY: "auto",
                flex: 1,
                lineHeight: 1.7,
                fontSize: "15px",
              }}
            >
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  color: "var(--content-text)",
                  margin: 0,
                }}
              >
                {question}
              </pre>
            </div>
          </div>

          {/* Code Editor Panel */}
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "var(--color-surface)",
              borderRadius: "12px",
              border: "1px solid var(--color-border-primary)",
              overflow: "hidden",
              boxShadow: "var(--shadow-primary)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                backgroundColor: "var(--header-bg)",
                borderBottom: "1px solid var(--color-border-primary)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 17L22 12L17 7M7 7L2 12L7 17M13 3L11 21"
                    stroke="var(--accent-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Code Editor
              </h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setCode(languageTemplates[language])}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--color-border-secondary)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12V8C4 7.44772 4.44772 7 5 7H14L18 11V12M4 12V16C4 16.5523 4.44772 17 5 17H19C19.5523 17 20 16.5523 20 16V12M4 12H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Template
                </button>
                <button
                  onClick={() => setCode("")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--color-border-secondary)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 5L5 19M5 5L19 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  style={{
                    padding: "8px 20px",
                    background: verifying
                      ? "var(--color-surface)"
                      : "var(--bg-submit-gradient)",
                    color: verifying ? "var(--text-secondary)" : "var(--text-dark)",
                    border: "none",
                    borderRadius: "6px",
                    cursor: verifying ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {verifying ? (
                    "Running..."
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 5V19L19 12L8 5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Run Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editor with line numbers */}
            <div style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              backgroundColor: 'var(--card-bg)',
              overflow: 'hidden'
            }}>
              {/* Line numbers column */}
              <div
                ref={lineNumbersRef}
                style={{
                  width: '40px',
                  padding: '20px 8px',
                  backgroundColor: 'var(--color-surface)',
                  borderRight: '1px solid var(--color-border-primary)',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  fontSize: '15px',
                  lineHeight: 1.5,
                  textAlign: 'right',
                  userSelect: 'none',
                  overflowY: 'hidden'
                }}
              >
                {Array.from({ length: code.split('\n').length }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>
              
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleScroll}
                placeholder={`// Write your ${languageInfo[language].name} solution here...\n// Use the provided function signature`}
                style={{
                  flex: 1,
    padding: "16px",
    backgroundColor: "var(--editor-bg)", // dark editor theme
    color: "var(--editor-fg, #d4d4d4)",
    fontSize: "14px",
    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
    fontWeight: 400,
    resize: "none",
    outline: "none",
    border: "none",
    lineHeight: 1.6,
    tabSize: 4,
    overflow: "auto",
    whiteSpace: "pre",
    caretColor: "#00ffcc", // bright cursor
                }}
                spellCheck="false"
              />
            </div>

            <div
              style={{
                padding: "12px 20px",
                backgroundColor: "var(--header-bg)",
                borderTop: "1px solid var(--color-border-primary)",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    padding: "2px 4px",
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--text-dark)",
                    borderRadius: "4px",
                  }}
                >
                  {languageInfo[language].icon}
                </span>
                {languageInfo[language].name}
                <span style={{ color: "var(--text-tertiary)" }}>
                  {languageInfo[language].extension}
                </span>
              </span>
              <span>
                Lines: {code.split("\n").length}, Chars: {code.length}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "70vh",
            textAlign: "center",
            padding: "40px",
            backgroundColor: "var(--no-topic-bg)",
            borderRadius: "12px",
            border: "1px dashed var(--no-topic-border)",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "var(--overlay-pattern)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3
            style={{
              fontSize: "1.5rem",
              margin: "0 0 12px 0",
              background: "var(--gradient-accent)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Ready to Challenge Yourself?
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: "600px",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            Enter a programming topic, select a difficulty level and programming language to generate
            a coding challenge. Test your skills and improve your
            problem-solving abilities.
          </p>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                border: "1px solid var(--color-border-secondary)",
              }}
            >
              arrays
            </div>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                border: "1px solid var(--color-border-secondary)",
              }}
            >
              trees
            </div>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--color-surface)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                border: "1px solid var(--color-border-secondary)",
              }}
            >
              dynamic programming
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {Object.entries(languageInfo).map(([key, info]) => (
              <div
                key={key}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "rgba(var(--accent-primary-rgb), 0.1)",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  color: "var(--accent-primary)",
                  border: "1px solid var(--border-accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    padding: "1px 3px",
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--text-dark)",
                    borderRadius: "2px",
                  }}
                >
                  {info.icon}
                </span>
                {info.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Result Panel with Syntax Check */}
      {result && parsedResult && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 80,
            right: 0,
            backgroundColor: "var(--color-surface-darker)",
            borderTop: "1px solid var(--color-border-primary)",
            maxHeight: expanded ? "350px" : "60px",
            transition: "max-height 0.3s ease",
            boxShadow: "0 -5px 15px rgba(0, 0, 0, 0.2)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 24px 20px 100px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              backgroundColor: "var(--header-bg)",
              borderBottom: expanded
                ? "1px solid var(--color-border-primary)"
                : "none",
            }}
            onClick={toggleResultPanel}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor:
                    parsedResult.status === "accepted"
                      ? "var(--success)"
                      : parsedResult.status === "compilation-error"
                      ? "var(--danger)"
                      : parsedResult.status === "runtime-error"
                      ? "var(--danger)"
                      : "var(--issues-color)",
                }}
              />
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  color:
                    parsedResult.status === "accepted"
                      ? "var(--success)"
                      : parsedResult.status === "compilation-error"
                      ? "var(--danger)"
                      : parsedResult.status === "runtime-error"
                      ? "var(--danger)"
                      : "var(--issues-color)",
                }}
              >
                {parsedResult.status === "accepted"
                  ? "Accepted"
                  : parsedResult.status === "compilation-error"
                  ? "Compilation Error"
                  : parsedResult.status === "runtime-error"
                  ? "Runtime Error"
                  : "Wrong Answer"}
              </h3>
            </div>
            <div
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.3s ease",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="var(--text-secondary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          <div
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              maxHeight: "290px",
            }}
          >
            {/* Syntax Check Result */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                padding: "16px",
                borderRadius: "8px",
                border: `1px solid ${
                  parsedResult.syntaxCheck.passed ? "var(--success)" : "var(--danger)"
                }`,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: parsedResult.syntaxCheck.passed
                      ? "rgba(var(--success-rgb), 0.1)"
                      : "rgba(var(--danger-rgb), 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {parsedResult.syntaxCheck.passed ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 13L9 17L19 7"
                        stroke="var(--success)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 18L18 6M6 6L18 18"
                        stroke="var(--danger)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    color: parsedResult.syntaxCheck.passed
                      ? "var(--success)"
                      : "var(--danger)",
                  }}
                >
                  Syntax Check - {parsedResult.syntaxCheck.passed ? "Passed" : "Failed"}
                </h4>
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  marginLeft: "32px",
                }}
              >
                {parsedResult.syntaxCheck.text
                  .replace("Syntax Check:", "")
                  .trim()}
              </div>
            </div>

            {/* Test Cases Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {parsedResult.testCases.map((testCase) => (
                <div
                  key={testCase.id}
                  style={{
                    backgroundColor: "var(--color-surface)",
                    padding: "16px",
                    borderRadius: "8px",
                    border: `1px solid ${
                      testCase.skipped 
                        ? "var(--text-secondary)"
                        : testCase.passed 
                        ? "var(--success)" 
                        : "var(--danger)"
                    }`,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    opacity: testCase.skipped ? 0.6 : 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: testCase.skipped
                          ? "rgba(var(--text-secondary-rgb), 0.1)"
                          : testCase.passed
                          ? "rgba(var(--success-rgb), 0.1)"
                          : "rgba(var(--danger-rgb), 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {testCase.skipped ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3 12H21M12 3V21"
                            stroke="var(--text-secondary)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : testCase.passed ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 13L9 17L19 7"
                            stroke="var(--success)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 18L18 6M6 6L18 18"
                            stroke="var(--danger)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "1rem",
                        color: testCase.skipped
                          ? "var(--text-secondary)"
                          : testCase.passed
                          ? "var(--success)"
                          : "var(--danger)",
                      }}
                    >
                      Test Case {testCase.id} -{" "}
                      {testCase.skipped 
                        ? "Skipped" 
                        : testCase.passed 
                        ? "Passed" 
                        : "Failed"}
                    </h4>
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      marginLeft: "32px",
                    }}
                  >
                    {testCase.text
                      .replace(`Test Case ${testCase.id}:`, "")
                      .trim()}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Result */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                padding: "16px",
                borderRadius: "8px",
                border: `1px solid ${
                  parsedResult.status === "accepted"
                    ? "var(--success)"
                    : parsedResult.status === "compilation-error"
                    ? "var(--danger)"
                    : parsedResult.status === "runtime-error"
                    ? "var(--danger)"
                    : "var(--issues-color)"
                }`,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor:
                      parsedResult.status === "accepted"
                        ? "rgba(var(--success-rgb), 0.1)"
                        : parsedResult.status === "compilation-error"
                        ? "rgba(var(--danger-rgb), 0.1)"
                        : parsedResult.status === "runtime-error"
                        ? "rgba(var(--danger-rgb), 0.1)"
                        : "rgba(var(--issues-color-rgb), 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {parsedResult.status === "accepted" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="var(--success)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 14L12 12M12 12L14 10M12 12L10 10M12 12L14 14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke={
                          parsedResult.status === "compilation-error" || 
                          parsedResult.status === "runtime-error"
                            ? "var(--danger)"
                            : "var(--issues-color)"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    color:
                      parsedResult.status === "accepted"
                        ? "var(--success)"
                        : parsedResult.status === "compilation-error"
                        ? "var(--danger)"
                        : parsedResult.status === "runtime-error"
                        ? "var(--danger)"
                        : "var(--issues-color)",
                  }}
                >
                  Final Result
                </h4>
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  color: "var(--text-primary)",
                  fontWeight: 500,
                  marginLeft: "32px",
                }}
              >
                {parsedResult.overallResult
                  .replace("Overall Result:", "")
                  .trim()}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        textarea {
          tab-size: 4;
        }

        @media (max-width: 1024px) {
          .main-content {
            flex-direction: column;
            height: auto;
          }

          .question-panel {
            border-right: none;
            border-bottom: 1px solid var(--color-border-primary);
            max-height: 50vh;
          }

          .code-panel {
            min-height: 400px;
          }
        }

        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
            align-items: stretch;
          }

          .topic-input,
          .generate-btn {
            width: 100%;
            min-width: auto;
          }

          .code-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}