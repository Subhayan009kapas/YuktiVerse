import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import "./RenamePrompt.css";

export default function RenamePrompt({ currentName, onRename, onCancel }) {
  const [val, setVal] = useState(currentName);
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKey = (e) => {
    if (e.key === "Enter") onRename(val.trim() || currentName);
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="rp-backdrop" onClick={onCancel}>
      <div
        className="rp-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="rp-close" onClick={onCancel}>
          <FaTimes />
        </button>
        <h3 className="rp-title">Rename Item</h3>
        <input
          ref={inputRef}
          className="rp-input"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder="New name…"
        />
        <div className="rp-actions">
          <button
            className="rp-btn rp-ok"
            onClick={() => onRename(val.trim() || currentName)}
          >
            OK
          </button>
          <button className="rp-btn rp-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
