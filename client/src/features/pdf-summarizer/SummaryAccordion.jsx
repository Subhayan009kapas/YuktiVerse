import React, { useEffect, useState, useRef } from "react";
import { FiChevronDown, FiChevronUp, FiCheck, FiX } from "react-icons/fi";
import "./SummaryAccordion.css";
const SummaryAccordion = ({ summary }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const contentRefs = useRef([]);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  // Auto-scroll to opened section
  useEffect(() => {
    if (activeIndex !== -1 && contentRefs.current[activeIndex]) {
      contentRefs.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  if (!Array.isArray(summary)) {
    return (
      <div className="techadda-summary-error">
        <FiX className="error-icon" />
        <span>Summary is not available or in incorrect format.</span>
      </div>
    );
  }

  return (
    <div className="techadda-accordion-container">
      {summary.map((section, index) => {
        const isActive = activeIndex === index;
        const hasBullets =
          Array.isArray(section.bullets) && section.bullets.length > 0;

        return (
          <div
            key={index}
            ref={(el) => (contentRefs.current[index] = el)}
            className={`techadda-accordion-item ${isActive ? "active" : ""}`}
          >
            <div
              className="techadda-accordion-header"
              onClick={() => toggle(index)}
              aria-expanded={isActive}
            >
              <div className="header-content">
                <div className="section-indicator">
                  <span className="section-number">{index + 1}</span>
                  {isActive && <div className="active-pulse"></div>}
                </div>

                <div className="title-wrapper">
                  <h4 className="techadda-accordion-title">
                    {section.title}
                    {hasBullets && (
                      <span className="bullet-count">
                        {section.bullets.length} key points
                      </span>
                    )}
                  </h4>
                  {section.subtitle && (
                    <p className="techadda-accordion-subtitle">
                      {section.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <span className="techadda-accordion-icon">
                {isActive ? <FiChevronUp /> : <FiChevronDown />}
              </span>
            </div>

            <div
              className={`techadda-accordion-content ${isActive ? "open" : ""}`}
              style={{ maxHeight: isActive ? "1000px" : "0" }}
            >
              <div className="content-inner">
                <div className="content-header">
                  <div className="section-highlight"></div>
                  <p className="techadda-accordion-description">
                    {section.content}
                  </p>
                </div>

                {hasBullets && (
                  <div className="key-points-container">
                    <div className="key-points-header">
                      <FiCheck className="check-icon" />
                      <span>Key Points</span>
                    </div>
                    <ul className="techadda-bullet-list">
                      {section.bullets.map((point, i) => (
                        <li key={i} className="techadda-accordion-point">
                          <div className="bullet-indicator">
                            <div className="bullet-icon"></div>
                          </div>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default SummaryAccordion;
