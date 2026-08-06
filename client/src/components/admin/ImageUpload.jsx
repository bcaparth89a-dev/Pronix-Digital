import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { apiClient } from "@/services/apiClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000, // 2 minutes timeout for this large upload request
  });
  return response.data.data; // { url, publicId }
}

export function ImageUpload({ value, onChange, label, multiple = false, className }) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const [ratioWarning, setRatioWarning] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  async function handleFiles(files) {
    const validFiles = [...files].filter((f) => f.type.startsWith("image/"));
    if (!validFiles.length) {
      setError("Please select image files only.");
      return;
    }
    setError("");
    setRatioWarning("");
    
    // Check aspect ratio for single uploads
    if (validFiles[0] && !multiple) {
      const url = URL.createObjectURL(validFiles[0]);
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        // Ideal is 16:10 (1.6) or 16:9 (1.777)
        if (ratio < 1.45 || ratio > 1.85) {
          setRatioWarning("This image may be cropped in preview cards. Recommended ratio is 16:10 or 16:9.");
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    setUploading(true);
    setUploadStatus("Uploading image...");
    try {
      if (multiple) {
        const results = await Promise.all(
          validFiles.map(async (file) => {
            return await uploadFile(file);
          })
        );
        setUploadStatus("Finalizing...");
        onChange([...(Array.isArray(value) ? value : []), ...results]);
      } else {
        const result = await uploadFile(validFiles[0]);
        setUploadStatus("Finalizing...");
        onChange(result);
      }
      setUploadStatus("Completed");
    } catch (err) {
      setError(err.message || "Upload failed. Try again.");
      setUploadStatus("");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  function removeImage(idx) {
    setRatioWarning("");
    if (multiple) {
      onChange((Array.isArray(value) ? value : []).filter((_, i) => i !== idx));
    } else {
      onChange(null);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}

      {/* Drop zone */}
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-6 transition-colors cursor-pointer",
          dragOver ? "border-primary/50 bg-primary/5" : "hover:bg-muted/30",
          uploading && "pointer-events-none opacity-60",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label={`Upload ${multiple ? "images" : "image"}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">{uploadStatus || "Uploading..."}</p>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Click or drag &amp; drop</p>
              <p className="text-xs text-muted-foreground">
                {multiple ? "Multiple images supported" : "Single image"} - PNG, JPG, WebP up to 10MB
              </p>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
      />

      {/* Single preview */}
      {!multiple && value?.url && (
        <div className="relative w-full overflow-hidden rounded-lg border">
          <img
            src={value.url}
            alt={value.alt || "Uploaded image"}
            className="h-48 w-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-7 w-7"
            onClick={() => removeImage(0)}
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Multiple preview grid */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((img, i) => (
            <div key={`${img.publicId ?? i}`} className="group relative aspect-square overflow-hidden rounded-lg border">
              <img
                src={img.url}
                alt={img.alt || `Image ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(i)}
                aria-label={`Remove image ${i + 1}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {ratioWarning && <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">{ratioWarning}</p>}
    </div>
  );
}
