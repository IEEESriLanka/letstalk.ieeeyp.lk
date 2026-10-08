import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";

export interface LightboxImage {
  id: string;
  image_url: string;
  title: string;
  caption?: string | null;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  albumTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export function ImageLightbox({
  images,
  currentIndex,
  albumTitle,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const startPosRef = useRef({ x: 0, y: 0 });
  const startPanRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [currentIndex]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, Number((z + ZOOM_STEP).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, Number((z - ZOOM_STEP).toFixed(2)));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleToggleZoom = useCallback(() => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && images.length > 1) {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight" && images.length > 1) {
        onNavigate((currentIndex + 1) % images.length);
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, currentIndex, onClose, onNavigate, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isOpen) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isOpen, handleZoomIn, handleZoomOut]);

  // Pointer drag for panning when zoomed
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    if (e.button !== 0) return; // Only primary mouse button
    setIsDragging(true);
    hasDraggedRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...pan };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }
    setPan({
      x: startPanRef.current.x + dx,
      y: startPanRef.current.y + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !hasDraggedRef.current) {
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-md select-none"
          onClick={handleBackdropClick}
        >
          {/* Top Control Bar */}
          <div className="relative z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-black/40 px-4 py-3 sm:px-6 backdrop-blur-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {currentIndex + 1} / {images.length}
              </span>
              {albumTitle && (
                <span className="truncate text-sm font-medium text-white/70 hidden sm:inline">
                  {albumTitle}
                </span>
              )}
            </div>

            {/* Zoom Controls & Close */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-md">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  title="Zoom out (-)"
                  className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ZoomOut className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset zoom (0)"
                  className="px-2 text-xs font-mono font-medium text-white/90 transition-colors hover:text-orange-soft"
                >
                  {Math.round(zoom * 100)}%
                </button>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  title="Zoom in (+)"
                  className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ZoomIn className="size-4" />
                </button>

                {zoom !== 1 && (
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    title="Reset view"
                    className="ml-1 rounded-full p-1.5 text-orange-soft transition-colors hover:bg-white/15"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                title="Close (Esc)"
                className="rounded-full border border-white/15 bg-white/10 p-2 text-white/85 transition-all hover:bg-white/20 hover:text-white hover:scale-105"
              >
                <X className="size-4.5" />
              </button>
            </div>
          </div>

          {/* Main Viewport */}
          <div
            ref={containerRef}
            onClick={handleBackdropClick}
            className="relative flex flex-1 items-center justify-center overflow-hidden p-4 sm:p-8"
          >
            {/* Previous Image Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((currentIndex - 1 + images.length) % images.length);
                }}
                title="Previous image (Left Arrow)"
                className="absolute left-4 z-20 hidden sm:flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white hover:scale-110"
              >
                <ChevronLeft className="size-6" />
              </button>
            )}

            {/* Next Image Button */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate((currentIndex + 1) % images.length);
                }}
                title="Next image (Right Arrow)"
                className="absolute right-4 z-20 hidden sm:flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white/90 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white hover:scale-110"
              >
                <ChevronRight className="size-6" />
              </button>
            )}

            {/* Zoomable Image Container */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={handleToggleZoom}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)",
                cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              }}
              className="relative max-h-full max-w-full touch-none select-none"
            >
              <img
                src={currentImage.image_url}
                alt={currentImage.title}
                draggable={false}
                className="max-h-[75vh] sm:max-h-[82vh] w-auto max-w-full rounded-xl object-contain shadow-2xl pointer-events-none"
              />
            </div>
          </div>

          {/* Bottom Caption Bar */}
          <div className="relative z-20 border-t border-white/10 bg-black/40 px-6 py-3.5 text-center backdrop-blur-sm">
            <div className="text-[11px] text-white/40 flex items-center justify-center gap-2">
              <span>Double-click or scroll to zoom</span>
              {zoom > 1 && <span>• Drag to pan</span>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
