import React, { useEffect, useRef, useState, useCallback } from "react";
import { IoIosClose } from "react-icons/io";

const MediaModal = ({ isOpen, onClose, media, activeIndex }) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [originOffset, setOriginOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null); // Ref for the zoomable container

  // Manage body overflow
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  // Reset zoom and pan when modal opens or activeIndex changes
  // Use useCallback to memoize resetZoom
  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIsDragging(false); // Ensure dragging is off
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetZoom();
    }
  }, [isOpen, activeIndex, resetZoom]); // Depend on resetZoom

  // Clamp translation values to keep image within bounds
  const clampTranslate = useCallback((newTranslateX, newTranslateY, currentScale) => {
    if (!imageRef.current || !containerRef.current || currentScale === 1) {
      return { x: 0, y: 0 };
    }

    const imageRect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate effective scaled dimensions of the image within the container
    // accounting for object-contain.
    const naturalAspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let displayWidth, displayHeight;

    if (naturalAspectRatio > containerAspectRatio) {
      // Image is wider than container, height is constrained
      displayWidth = containerRect.width;
      displayHeight = containerRect.width / naturalAspectRatio;
    } else {
      // Image is taller than container, width is constrained
      displayHeight = containerRect.height;
      displayWidth = containerRect.height * naturalAspectRatio;
    }

    const scaledWidth = displayWidth * currentScale;
    const scaledHeight = displayHeight * currentScale;

    // Calculate the maximum allowed translation based on the difference
    // between scaled size and container size, centered.
    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

    const clampedX = Math.max(-maxX, Math.min(maxX, newTranslateX));
    const clampedY = Math.max(-maxY, Math.min(maxY, newTranslateY));

    return { x: clampedX, y: clampedY };
  }, []);


  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();

      if (!imageRef.current || !containerRef.current) return;

      const scaleAmount = e.deltaY * -0.002; // Adjust sensitivity for smoother zoom
      let newScale = scale * (1 + scaleAmount);

      // Clamp scale between 1 and 4 (or a higher value if needed for detail)
      newScale = Math.min(Math.max(1, newScale), 4);

      if (newScale === scale) return; // No effective scale change

      const containerRect = containerRef.current.getBoundingClientRect();
      const imageRect = imageRef.current.getBoundingClientRect();

      // Mouse position relative to the image (current scaled size)
      const mouseX = e.clientX - imageRect.left;
      const mouseY = e.clientY - imageRect.top;

      // Calculate the focal point (where the mouse is) in the original (unscaled) image coordinate system
      const originalFocalX = mouseX / scale;
      const originalFocalY = mouseY / scale;

      // Calculate new translation to keep the focal point under the cursor
      let newTranslateX = translate.x + (originalFocalX * (scale - newScale));
      let newTranslateY = translate.y + (originalFocalY * (scale - newScale));

      // Apply clamping immediately after calculating new translation
      const clampedTranslate = clampTranslate(newTranslateX, newTranslateY, newScale);

      setScale(newScale);
      setTranslate(clampedTranslate);
    },
    [scale, translate, clampTranslate]
  );

  const handleDoubleClick = useCallback(() => {
    if (scale !== 1) {
      resetZoom();
    } else {
      // Zoom to 2x or a suitable default
      setScale(2);
      // Center the image after double-clicking to zoom in
      setTranslate(clampTranslate(0, 0, 2));
    }
  }, [scale, resetZoom, clampTranslate]);

  const startDrag = useCallback(
    (e) => {
      if (scale === 1) return; // Only allow drag when zoomed
      setIsDragging(true);

      const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

      setOriginOffset({
        x: clientX - translate.x,
        y: clientY - translate.y,
      });

      e.preventDefault(); // Prevent text selection or other default behaviors
    },
    [scale, translate]
  );

  const duringDrag = useCallback(
    (e) => {
      if (!isDragging || scale === 1) return;

      const clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
      const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;

      let newTranslateX = clientX - originOffset.x;
      let newTranslateY = clientY - originOffset.y;

      // Clamp translation during drag
      const clampedTranslate = clampTranslate(newTranslateX, newTranslateY, scale);

      setTranslate(clampedTranslate);
    },
    [isDragging, scale, originOffset, clampTranslate]
  );

  const stopDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!isOpen || !media?.length) return null;
  const mediaItem = media[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={(e) => {
        // Close modal if clicking on the backdrop and not dragging
        if (e.target === e.currentTarget && !isDragging) {
          resetZoom();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-xl overflow-hidden flex items-center justify-center">
        {/* Close Button */}
        <button
          onClick={() => {
            resetZoom();
            onClose();
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black-2 hover:bg-black/70 transition"
          aria-label="Close modal"
        >
          <IoIosClose className="w-7 h-7 text-white" />
        </button>

        {/* Reset Zoom Button */}
        {scale !== 1 && (
          <button
            onClick={resetZoom}
            className="absolute top-3 left-3 z-20 px-3 py-1 text-sm rounded-full bg-black-2 hover:bg-white/40 text-white transition"
            aria-label="Reset zoom"
          >
            Reset Zoom
          </button>
        )}

        {/* Media Container */}
        <div
          ref={containerRef} // Assign ref to the container
          className="w-full h-full flex items-center justify-center relative p-4" // Added padding to separate content from edge
          onDoubleClick={handleDoubleClick}
          onWheel={handleWheel}
          onMouseDown={startDrag}
          onMouseMove={duringDrag}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onTouchStart={startDrag}
          onTouchMove={duringDrag}
          onTouchEnd={stopDrag}
          // Prevent context menu on right-click, if needed
          onContextMenu={(e) => e.preventDefault()}
        >
          {mediaItem.type === "video" ? (
            <video
              src={mediaItem.url}
              controls
              className="w-full h-full object-contain rounded-lg shadow-lg"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()} // Prevent modal double-click on video
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full overflow-hidden">
              <img
                ref={imageRef}
                src={mediaItem.url}
                alt="Zoomable media"
                className="rounded-lg shadow-lg select-none pointer-events-none" // pointer-events-none ensures events go to parent
                style={{
                  transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                  cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out', // Slightly slower ease for zoom
                  objectFit: "contain", // Ensures initial fit
                  maxWidth: '100%', // Important for initial image sizing
                  maxHeight: '100%', // Important for initial image sizing
                }}
                draggable={false}
                // Stop propagation only for events that would interfere with modal
                // For product image zoom, we want the image to handle interactions
                // but the parent div is now responsible for the actual listeners.
                // The `pointer-events-none` on the image directs events to the parent.
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaModal;