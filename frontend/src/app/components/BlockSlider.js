import React, { useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, Circle, Dot } from "lucide-react";
import "./BlockSlider.css";

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

export default function BlockSlider({
  children,
  showDots = true,
  showArrows = true,
}) {
  const [current, setCurrent] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragged, setDragged] = useState(false);
  const containerRef = useRef(null);
  const numSlides = React.Children.count(children);
  console.log(children);

  // Dynamic viewport height for mobile Safari
  useEffect(() => {
    const setHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    };
    setHeight();
    window.addEventListener("resize", setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, []);

  // Snap to current slide on change
  useEffect(() => {
    if (containerRef.current && !isDragging) {
      containerRef.current.style.transform = `translateX(-${
        current * window.innerWidth
      }px)`;
    }
  }, [current, isDragging]);

  // Prevent unwanted selection during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }
    return () => {
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  // Touch/mouse event handlers
  const onStart = useCallback((clientX) => {
    setDragStart(clientX);
    setDragOffset(0);
    setIsDragging(true);
    setDragged(false);
  }, []);

  const onMove = useCallback(
    (clientX) => {
      if (dragStart !== null) {
        setDragOffset(clientX - dragStart);
        setDragged(true);
      }
    },
    [dragStart]
  );

  const onEnd = useCallback(() => {
    if (dragStart !== null) {
      const threshold = window.innerWidth / 4;
      let newCurrent = current;
      if (dragOffset < -threshold && current < numSlides - 1) {
        newCurrent = current + 1;
      } else if (dragOffset > threshold && current > 0) {
        newCurrent = current - 1;
      }
      setCurrent(clamp(newCurrent, 0, numSlides - 1));
      setDragStart(null);
      setDragOffset(0);
      setIsDragging(false);
      setTimeout(() => setDragged(false), 0);
    }
  }, [dragStart, dragOffset, current, numSlides]);

  // Mouse events
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left mouse button
    e.preventDefault();
    onStart(e.clientX);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => onMove(e.clientX);
  const handleMouseUp = () => {
    onEnd();
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  // Touch events
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      onStart(e.touches[0].clientX);
    }
  };
  const handleTouchMove = (e) => {
    if (dragStart !== null && e.touches.length === 1) {
      onMove(e.touches[0].clientX);
      e.preventDefault(); // Prevent horizontal scroll
    }
  };
  const handleTouchEnd = onEnd;

  // Navigation
  const goTo = (idx) => setCurrent(clamp(idx, 0, numSlides - 1));
  const goPrev = () => setCurrent((c) => clamp(c - 1, 0, numSlides - 1));
  const goNext = () => setCurrent((c) => clamp(c + 1, 0, numSlides - 1));

  // Calculate transform
  const translateX =
    -current * window.innerWidth + (dragStart !== null ? dragOffset : 0);

  // Prevent click after drag
  const handleClickCapture = (event) => {
    if (dragged) {
      event.stopPropagation();
      event.preventDefault();
    }
  };

  return (
    <div
      className="block-slider-viewport"
      style={{
        width: "100vw",
        height: "var(--app-height, 100vh)",
        overflow: "hidden",
        position: "relative",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClickCapture={handleClickCapture}
    >
      <div
        className="block-slider-container"
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "row",
          width: `${numSlides * 100}vw`,
          height: "var(--app-height, 100vh)",
          transform: `translateX(${translateX}px)`,
          transition:
            dragStart === null
              ? "transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)"
              : "none",
          touchAction: "pan-y",
        }}
      >
        {React.Children.map(children, (child, idx) => (
          <div
            className="block-slider-slide"
            style={{
              width: "100vw",
              height: "var(--app-height, 100vh)",
              flex: "0 0 100vw",
              overflow: "auto",
            }}
            key={idx}
          >
            {child}
          </div>
        ))}
      </div>
      {showArrows && (
        <>
          <button
            className="block-slider-arrow left"
            onClick={goPrev}
            disabled={current === 0}
            aria-label="Previous slide"
            tabIndex={0}
          >
            <ChevronLeft size={32} />
          </button>
          <button
            className="block-slider-arrow right"
            onClick={goNext}
            disabled={current === numSlides - 1}
            aria-label="Next slide"
            tabIndex={0}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
      {showDots && (
        <div className="block-slider-dots">
          {Array.from({ length: numSlides }).map((_, idx) => (
            <button
              key={idx}
              className={current === idx ? "active" : ""}
              onClick={() => goTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              tabIndex={0}
            >
              {current === idx ? <Circle size={16} /> : <Dot size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

BlockSlider.propTypes = {
  showDots: PropTypes.bool,
  showArrows: PropTypes.bool,
};
