"use client";

import { FaCaretDown } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useStorage, useMutation } from "@liveblocks/react";

const markers = Array.from({ length: 83 }, (_, i) => i);
const PAGE_WIDTH = 816;

export const Ruler = () => {
  const leftMargin = useStorage((root) => root.leftMargin) ?? 56;
  const setLeftMargin = useMutation(({ storage }, position: number) => {
    storage.set("leftMargin", position);
  }, []);
  const rightMargin = useStorage((root) => root.rightMargin) ?? 56;
  const setRightMargin = useMutation(({ storage }, position: number) => {
    storage.set("rightMargin", position);
  }, []);

  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const rulerRef = useRef<HTMLDivElement | null>(null);

  const [guideLeft, setGuideLeft] = useState<number | null>(null);

  const getContainerRect = () => {
    const container = rulerRef.current?.querySelector(
      "#ruler-container"
    ) as HTMLElement | null;
    return container?.getBoundingClientRect() || null;
  };

  useEffect(() => {
    const MINIMUM_SPACE = 100;

    function onPointerMove(e: PointerEvent) {
      const rect = getContainerRect();
      if (!rect) return;

      const relativeX = e.clientX - rect.left;
      const rawPosition = Math.max(0, Math.min(PAGE_WIDTH, relativeX));

      if (isDraggingLeft) {
        const maxLeftPosition = PAGE_WIDTH - rightMargin - MINIMUM_SPACE;
        const newLeftPosition = Math.min(rawPosition, maxLeftPosition);
        setLeftMargin(newLeftPosition);
        setGuideLeft(rect.left + newLeftPosition);
      } else if (isDraggingRight) {
        const maxRightPosition = PAGE_WIDTH - (leftMargin + MINIMUM_SPACE);
        const newRightPosition = Math.max(PAGE_WIDTH - rawPosition, 0);
        const constrainedRightPosition = Math.min(
          newRightPosition,
          maxRightPosition
        );
        setRightMargin(constrainedRightPosition);
        setGuideLeft(rect.left + (PAGE_WIDTH - constrainedRightPosition));
      }
    }

    function onPointerUp() {
      if (isDraggingLeft) setIsDraggingLeft(false);
      if (isDraggingRight) setIsDraggingRight(false);
      setGuideLeft(null);
    }

    if (isDraggingLeft || isDraggingRight) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };
    }
  }, [
    isDraggingLeft,
    isDraggingRight,
    leftMargin,
    rightMargin,
    setLeftMargin,
    setRightMargin,
  ]);

  const handleLeftDoubleClick = () => setLeftMargin(56);
  const handleRightDoubleClick = () => setRightMargin(56);

  const startDragLeft = () => {
    const rect = getContainerRect();
    if (rect) setGuideLeft(rect.left + leftMargin);
    setIsDraggingLeft(true);
  };
  const startDragRight = () => {
    const rect = getContainerRect();
    if (rect) setGuideLeft(rect.left + (PAGE_WIDTH - rightMargin));
    setIsDraggingRight(true);
  };

  return (
    <div
      ref={rulerRef}
      className="w-[816px] mx-auto h-6 flex items-end relative select-none print:hidden border-b"
      style={{ borderColor: "var(--input-border)" }}
      aria-label="Ruler"
    >
      <div id="ruler-container" className="w-full h-full relative">
        <Marker
          position={leftMargin}
          isLeft
          isDragging={isDraggingLeft}
          onStartDrag={startDragLeft}
          onDoubleClick={handleLeftDoubleClick}
        />

        <Marker
          position={rightMargin}
          isLeft={false}
          isDragging={isDraggingRight}
          onStartDrag={startDragRight}
          onDoubleClick={handleRightDoubleClick}
        />

        <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none">
          <div className="relative h-full w-[816px]">
            {markers.map((marker) => {
              const position = (marker * PAGE_WIDTH) / 82;
              return (
                <div
                  key={marker}
                  className="absolute bottom-0"
                  style={{ left: `${position}px` }}
                >
                  {marker % 10 === 0 && (
                    <>
                      <div className="absolute bottom-0 w-px h-2 bg-[var(--black)]" />
                      <span className="absolute bottom-2 text-[10px] text-[var(--black)] transform -translate-x-1/2 select-none">
                        {marker / 10 + 1}
                      </span>
                    </>
                  )}
                  {marker % 5 === 0 && marker % 10 !== 0 && (
                    <div className="absolute bottom-0 w-px h-1.5 bg-[var(--black)]" />
                  )}
                  {marker % 5 !== 0 && (
                    <div className="absolute bottom-0 w-px h-1 bg-[var(--black)]/80" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {guideLeft !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: `${guideLeft}px`,
            height: "100vh",
            width: 1,
            backgroundColor: "var(--strong-green)",
            opacity: 0.6,
            transform: "scaleX(0.6)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

interface MarkerProps {
  position: number;
  isLeft: boolean;
  isDragging: boolean;
  onStartDrag: () => void;
  onDoubleClick: () => void;
}

const Marker = ({
  position,
  isLeft,
  isDragging,
  onStartDrag,
  onDoubleClick,
}: MarkerProps) => {
  const leftPx = isLeft ? position : PAGE_WIDTH - position;

  return (
    <div
      className="absolute top-0 z-[5] pointer-events-none"
      style={{ left: `${leftPx}px`, transform: "translateX(-50%)" }}
    >
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onStartDrag();
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDoubleClick();
        }}
        className="w-5 h-6 cursor-ew-resize pointer-events-auto flex items-start justify-center
                   rounded-sm ring-0 hover:ring-2 hover:ring-[var(--light-green)] hover:ring-offset-1 hover:ring-offset-[var(--white)]
                   transition-all duration-150"
        title={
          isLeft
            ? `Left margin: ${Math.round(position)}px`
            : `Right margin: ${Math.round(position)}px`
        }
        aria-label={
          isLeft
            ? `Adjust left margin, current ${Math.round(position)} pixels`
            : `Adjust right margin, current ${Math.round(position)} pixels`
        }
      >
        <FaCaretDown
          className="text-[var(--black)]"
          style={{ opacity: isDragging ? 1 : 0.9 }}
        />
      </div>
    </div>
  );
};
