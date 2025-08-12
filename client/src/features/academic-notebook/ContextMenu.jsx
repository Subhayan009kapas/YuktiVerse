// ContextMenu.jsx
import React from "react";
import { FaPlus, FaEdit, FaArrowsAlt, FaStar, FaTrash } from "react-icons/fa";

export default function ContextMenu({
  x,
  y,
  type,
  item,
  selectedYear,
  importantFiles,
  onCloseMenu,
  onCreateSubject,
  onCreateChapter,
  onCreateFile,
  onStartRename,
  onStartMove,
  onToggleImportant,
  onDelete,
}) {
  const isImportant = importantFiles.some((f) => f.name === item?.name);
  return (
    <ul
      className="context-menu"
      style={{ top: y, left: x, zIndex: 2000 }}
      onClick={(e) => e.stopPropagation()}
    >
      {type === "year" && (
        <li
          onClick={() => {
            onCreateSubject(item);
            onCloseMenu();
          }}
        >
          <FaPlus /> New Subject
        </li>
      )}
      {type === "subject" && (
        <li
          onClick={() => {
            onCreateChapter(selectedYear, item);
            onCloseMenu();
          }}
        >
          <FaPlus /> New Chapter
        </li>
      )}
      {type === "chapter" && (
        <li
          onClick={() => {
            onCreateFile();
            onCloseMenu();
          }}
        >
          <FaPlus /> New File / Note
        </li>
      )}
      <li
        onClick={() => {
          onStartRename(type, item);
          onCloseMenu();
        }}
      >
        <FaEdit /> Rename
      </li>
      <li
        onClick={() => {
          onStartMove(type, item);
          onCloseMenu();
        }}
      >
        <FaArrowsAlt /> Move
      </li>
      {type === "file" && (
        <li
          onClick={() => {
            onToggleImportant(item);
            onCloseMenu();
          }}
        >
          <FaStar /> {isImportant ? "Unmark Important" : "Mark Important"}
        </li>
      )}
      <li
        className="delete"
        onClick={() => {
          onDelete(type, item);
          onCloseMenu();
        }}
      >
        <FaTrash /> Delete
      </li>
    </ul>
  );
}
