import React, { useRef, useState, useEffect } from "react";
import { EyeOff, Check, X, RotateCcw, AlertTriangle, Shield } from "lucide-react";

interface RedactScreenshotModalProps {
  isOpen: boolean;
  imageBase64: string;
  onApplyRedaction: (newImageBase64: string) => void;
  onClose: () => void;
}

export const RedactScreenshotModal: React.FC<RedactScreenshotModalProps> = ({
  isOpen,
  imageBase64,
  onApplyRedaction,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Load image onto canvas when modal opens
  useEffect(() => {
    if (!isOpen || !imageBase64) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageBase64;
    img.onload = () => {
      setImgElement(img);
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
    };
  }, [isOpen, imageBase64]);

  if (!isOpen) return null;

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Restore previous state while dragging rectangle
    if (history.length > 0) {
      ctx.putImageData(history[history.length - 1], 0, 0);
    }

    const currentCoords = getCanvasCoords(e);
    const x = Math.min(startPos.x, currentCoords.x);
    const y = Math.min(startPos.y, currentCoords.y);
    const width = Math.abs(currentCoords.x - startPos.x);
    const height = Math.abs(currentCoords.y - startPos.y);

    // Render semi-transparent preview while dragging
    ctx.fillStyle = "rgba(22, 28, 36, 0.85)";
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = "#D96B27";
    ctx.lineWidth = Math.max(3, canvas.width * 0.004);
    ctx.strokeRect(x, y, width, height);
  };

  const handleEnd = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let currentCoords = startPos;
    if ("changedTouches" in e && e.changedTouches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      currentCoords = {
        x: (e.changedTouches[0].clientX - rect.left) * scaleX,
        y: (e.changedTouches[0].clientY - rect.top) * scaleY,
      };
    }

    // Restore to commit solid privacy redaction bar
    if (history.length > 0) {
      ctx.putImageData(history[history.length - 1], 0, 0);
    }

    const x = Math.min(startPos.x, currentCoords.x);
    const y = Math.min(startPos.y, currentCoords.y);
    const width = Math.abs(currentCoords.x - startPos.x);
    const height = Math.abs(currentCoords.y - startPos.y);

    // Only apply if user dragged more than a tiny tap
    if (width > 8 || height > 8) {
      // Solid opaque privacy redaction fill
      ctx.fillStyle = "#111827";
      ctx.fillRect(x, y, width, height);

      // Add a subtle hatched privacy lock indicator
      ctx.fillStyle = "#374151";
      ctx.fillRect(x + 2, y + 2, Math.max(0, width - 4), Math.max(0, Math.min(height - 4, 3)));

      const newSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prev) => [...prev, newSnapshot]);
    }

    setStartPos(null);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updatedHistory = history.slice(0, history.length - 1);
    const lastSnapshot = updatedHistory[updatedHistory.length - 1];
    ctx.putImageData(lastSnapshot, 0, 0);
    setHistory(updatedHistory);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const redactedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onApplyRedaction(redactedDataUrl);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FFFFFF] border-2 border-[#1E4D3E] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E5DEC9] bg-[#F7F2EB] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1E4D3E] text-white flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-[#8FB89A]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1E4D3E]">
                حساس معلومات چھپائیں (Privacy Redaction Tool)
              </h3>
              <p className="text-xs text-stone-600">
                انگلی یا ماؤس سے سکرین پر کھینچیں اور حساس نمبر یا تفصیلات چھپا لیں
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 disabled:opacity-40 text-stone-700 text-xs font-bold border border-[#E5DEC9] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پہلے جیسا کریں (Undo)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-xl hover:bg-white cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gentle Notice */}
        <div className="bg-[#FCE8DC] px-4 py-2 border-b border-[#E07A48] flex items-center gap-2 text-xs text-[#1E4D3E] font-medium">
          <Shield className="w-4 h-4 text-[#D96B27] shrink-0" />
          <span>
            بینک بیلنس، شناختی کارڈ، یا ذاتی نمبر پر ڈبہ بنا کر اسے کالا کر لیں۔
          </span>
        </div>

        {/* Canvas Workspace Area */}
        <div className="flex-1 overflow-auto bg-stone-900/95 p-4 flex items-center justify-center select-none touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
            className="max-h-[62vh] max-w-full object-contain cursor-crosshair rounded-xl shadow-lg border border-stone-700 bg-stone-800"
          />
        </div>

        {/* Bottom Confirmation Actions */}
        <div className="p-4 bg-[#FFFFFF] border-t border-[#E5DEC9] flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-stone-500">
            {history.length > 1
              ? `✓ ${history.length - 1} جگہ چھپائی جا چکی ہے`
              : "سکرین پر ڈبہ کھینچ کر معلومات چھپائیں"}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm cursor-pointer"
            >
              منسوخ کریں (Cancel)
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-[#1E4D3E] hover:bg-[#163B2F] text-white font-serif font-bold text-sm shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#8FB89A]" />
              <span>محفوظ کریں (Save Redacted Screen)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
