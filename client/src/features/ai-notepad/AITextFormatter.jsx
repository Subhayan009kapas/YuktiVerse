import React from 'react';

const AITextFormatter = ({ text }) => {
  const formatText = (rawText) => {
    if (!rawText) return [];

    // Split text into lines
    const lines = rawText.split('\n');
    const formattedElements = [];
    let currentCodeBlock = [];
    let inCodeBlock = false;
    let currentList = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines unless we're in a code block
      if (line === '' && !inCodeBlock) {
        // End current list if we encounter empty line
        if (inList && currentList.length > 0) {
          formattedElements.push({
            type: 'list',
            content: [...currentList],
            key: `list-${i}`
          });
          currentList = [];
          inList = false;
        }
        continue;
      }

      // Detect code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          formattedElements.push({
            type: 'code',
            content: currentCodeBlock.join('\n'),
            language: currentCodeBlock[0] ? currentCodeBlock[0].replace('```', '') : 'python',
            key: `code-${i}`
          });
          currentCodeBlock = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
          // End current list if starting code block
          if (inList && currentList.length > 0) {
            formattedElements.push({
              type: 'list',
              content: [...currentList],
              key: `list-${i}`
            });
            currentList = [];
            inList = false;
          }
        }
        continue;
      }

      // If we're in a code block, collect code lines
      if (inCodeBlock) {
        currentCodeBlock.push(line);
        continue;
      }

      // Detect headers (lines followed by ** or lines with multiple caps)
      if (line.match(/^\*\*.*\*\*:?$/) || 
          (line.length < 50 && line.match(/^[A-Z][^.!?]*:?$/) && 
           !line.startsWith('Array:') && !line.startsWith('Example:'))) {
        
        // End current list if starting header
        if (inList && currentList.length > 0) {
          formattedElements.push({
            type: 'list',
            content: [...currentList],
            key: `list-${i}`
          });
          currentList = [];
          inList = false;
        }

        formattedElements.push({
          type: 'header',
          content: line.replace(/\*\*/g, ''),
          key: `header-${i}`
        });
        continue;
      }

      // Detect bullet points or numbered lists
      if (line.match(/^[*-]\s+/) || line.match(/^\d+\.\s+/)) {
        const content = line.replace(/^[*-]\s+/, '').replace(/^\d+\.\s+/, '');
        currentList.push(content);
        inList = true;
        continue;
      }

      // If we were in a list but this line isn't a list item, end the list
      if (inList && !line.match(/^[*-]\s+/) && !line.match(/^\d+\.\s+/)) {
        formattedElements.push({
          type: 'list',
          content: [...currentList],
          key: `list-${i}`
        });
        currentList = [];
        inList = false;
      }

      // Regular paragraph
      if (line.length > 0) {
        formattedElements.push({
          type: 'paragraph',
          content: line,
          key: `para-${i}`
        });
      }
    }

    // Handle any remaining list or code block
    if (inList && currentList.length > 0) {
      formattedElements.push({
        type: 'list',
        content: currentList,
        key: 'list-final'
      });
    }
    
    if (inCodeBlock && currentCodeBlock.length > 0) {
      formattedElements.push({
        type: 'code',
        content: currentCodeBlock.join('\n'),
        language: 'python',
        key: 'code-final'
      });
    }

    return formattedElements;
  };

  const renderInlineFormatting = (text) => {
    // Bold text **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text *text*
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
    
    return text;
  };

  const elements = formatText(text);

  return (
    <div className="ai-formatted-text">
      <style jsx>{`
        .ai-formatted-text {
          line-height: 1.6;
          color: #e2e8f0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .ai-header {
          font-size: 1.1em;
          font-weight: 700;
          color: #60a5fa;
          margin: 1.5em 0 0.8em 0;
          padding-bottom: 0.3em;
          border-bottom: 2px solid rgba(96, 165, 250, 0.3);
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ai-header:first-child {
          margin-top: 0;
        }

        .ai-paragraph {
          margin: 0.8em 0;
          color: #cbd5e1;
          text-align: justify;
        }

        .ai-list {
          margin: 1em 0;
          padding-left: 0;
        }

        .ai-list-item {
          display: flex;
          align-items: flex-start;
          margin: 0.6em 0;
          color: #cbd5e1;
        }

        .ai-list-bullet {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          margin-top: 2px;
          flex-shrink: 0;
          font-size: 10px;
          color: white;
          font-weight: bold;
        }

        .ai-code-block {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 1.2em;
          margin: 1.5em 0;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.9em;
          line-height: 1.5;
          color: #e2e8f0;
          overflow-x: auto;
          position: relative;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .ai-code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }

        .ai-code-language {
          font-size: 0.75em;
          color: #60a5fa;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ai-code-copy-btn {
          background: rgba(96, 165, 250, 0.1);
          border: 1px solid rgba(96, 165, 250, 0.3);
          color: #60a5fa;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.7em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ai-code-copy-btn:hover {
          background: rgba(96, 165, 250, 0.2);
          transform: translateY(-1px);
        }

        .ai-code-content {
          white-space: pre;
          font-size: 0.85em;
          color: #e2e8f0;
        }

        .inline-code {
          background: rgba(96, 165, 250, 0.15);
          color: #93c5fd;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 0.9em;
          border: 1px solid rgba(96, 165, 250, 0.2);
        }

        .ai-formatted-text strong {
          color: #60a5fa;
          font-weight: 700;
        }

        .ai-formatted-text em {
          color: #a78bfa;
          font-style: italic;
        }

        /* Syntax highlighting for common keywords */
        .ai-code-content {
          color: #e2e8f0;
        }

        /* Animation for elements */
        .ai-header, .ai-paragraph, .ai-list, .ai-code-block {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {elements.map((element, index) => {
        switch (element.type) {
          case 'header':
            return (
              <h3 
                key={element.key} 
                className="ai-header"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {element.content}
              </h3>
            );
            
          case 'paragraph':
            return (
              <p 
                key={element.key} 
                className="ai-paragraph"
                style={{ animationDelay: `${index * 0.1}s` }}
                dangerouslySetInnerHTML={{
                  __html: renderInlineFormatting(element.content)
                }}
              />
            );
            
          case 'list':
            return (
              <ul 
                key={element.key} 
                className="ai-list"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {element.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="ai-list-item">
                    <div className="ai-list-bullet">•</div>
                    <span dangerouslySetInnerHTML={{
                      __html: renderInlineFormatting(item)
                    }} />
                  </li>
                ))}
              </ul>
            );
            
          case 'code':
            return (
              <div 
                key={element.key} 
                className="ai-code-block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="ai-code-header">
                  <span className="ai-code-language">
                    {element.language || 'code'}
                  </span>
                  <button 
                    className="ai-code-copy-btn"
                    onClick={() => navigator.clipboard.writeText(element.content)}
                  >
                    Copy
                  </button>
                </div>
                <div className="ai-code-content">{element.content}</div>
              </div>
            );
            
          default:
            return null;
        }
      })}
    </div>
  );
};

// Smart Text Formatter that detects markdown-style formatting
const SmartTextFormatter = ({ text }) => {
  // Check if text contains markdown-style formatting
  const hasFormatting = (text) => {
    if (!text) return false;
    return (
      text.includes('```') ||      // Code blocks
      text.includes('**') ||       // Bold text
      text.includes('`') ||        // Inline code
      /^\* |\n\* /m.test(text) ||  // Bullet points
      /^\- |\n\- /m.test(text) ||  // Dash bullet points
      /^\d+\. |\n\d+\. /m.test(text) // Numbered lists
    );
  };

  // If no formatting detected, return plain text
  if (!hasFormatting(text)) {
    return <span style={{ color: '#cbd5e1' }}>{text}</span>;
  }

  // If formatting detected, use the formatter
  return <AITextFormatter text={text} />;
};

// Example usage showing both formatted and plain text
const TextFormatterDemo = () => {
  const formattedText = `The sliding window technique is a powerful algorithmic approach used to solve problems involving arrays, strings, or lists where you need to process a contiguous sub-section (a "window") of the data.

**Core Idea:**

The sliding window maintains two pointers: a \`left\` pointer and a \`right\` pointer. The algorithm iteratively expands the window by moving the \`right\` pointer and shrinks the window by moving the \`left\` pointer.

**Types of Sliding Window Problems:**

* **Fixed-Size Window:** The size remains constant throughout
* **Variable-Size Window:** The size dynamically adjusts based on conditions

\`\`\`python
def max_sum_subarray(arr, k):
    left = 0
    windowSum = 0
    maxSum = 0
    
    for right in range(len(arr)):
        windowSum += arr[right]
        if right >= k - 1:
            maxSum = max(maxSum, windowSum)
            windowSum -= arr[left]
            left += 1
    return maxSum
\`\`\``;

  const plainText = "This is just a simple response without any special formatting. It should display as normal text.";

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #0f172a, #1e293b)', 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: 'rgba(30, 41, 59, 0.8)',
        borderRadius: '16px',
        padding: '2rem',
        border: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h1 style={{ 
          color: '#60a5fa', 
          textAlign: 'center', 
          marginBottom: '2rem',
          background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Smart Text Formatter Demo
        </h1>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Formatted Response (AI):</h2>
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.5)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <SmartTextFormatter text={formattedText} />
          </div>
        </div>

        <div>
          <h2 style={{ color: '#60a5fa', marginBottom: '1rem' }}>Plain Response (User):</h2>
          <div style={{ 
            background: 'rgba(15, 23, 42, 0.5)', 
            padding: '1.5rem', 
            borderRadius: '12px',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <SmartTextFormatter text={plainText} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTextFormatter;