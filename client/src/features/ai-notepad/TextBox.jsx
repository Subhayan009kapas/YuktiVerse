// TextBox.jsx
import React, { useRef } from "react";
import { Rnd } from "react-rnd";
import { FaTimes, FaRobot } from "react-icons/fa";

const TextBox = React.memo(
  ({
    box,
    isActive,
    onChange,
    onBlur,
    onDelete,
    onAIButton,
    aiButtonRef,
    onDragStop,
    onResizeStop,
    onMouseDown,
    popover,
  }) => {
    const textareaRef = useRef(null);

    return (
      <Rnd
        key={box.id}
        position={{ x: box.x, y: box.y }}
        size={{ width: box.width, height: box.height }}
        minWidth={200}
        minHeight={100}
        bounds="parent"
        className={`text-box-container ${isActive ? "active" : ""}`}
        onDragStop={(e, d) => onDragStop(box.id, d)}
        onResizeStop={(e, direction, ref, delta, position) =>
          onResizeStop(box.id, ref, position)
        }
        onMouseDown={() => onMouseDown(box.id)}
        style={{ zIndex: box.zIndex }}
        dragHandleClassName="drag-handle"
      >
        <div className="drag-handle">
          <div className="handle-dots">•••</div>
          <div className="text-box-buttons">
            <button
              className="ai-button"
              onClick={(e) => onAIButton(box.id, e)}
              title="AI Assistant"
              ref={(el) => (aiButtonRef.current[box.id] = el)}
            >
              <FaRobot />
            </button>
            <button
              className="delete-button"
              onClick={(e) => onDelete(box.id, e)}
              title="Delete note"
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <textarea
          className="text-box"
          value={box.text}
          onChange={(e) => onChange(box.id, e)}
          onBlur={() => onBlur(box.id)}
          placeholder="Type here..."
          style={{ height: "100%" }}
          autoFocus={isActive}
          ref={textareaRef}
        />
        {popover}
      </Rnd>
    );
  }
);

export default TextBox;
