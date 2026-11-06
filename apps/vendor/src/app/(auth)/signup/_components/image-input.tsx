"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { useState } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "sonner";
import { Loader2, UploadCloud, CheckCircle2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageFieldProps {
  label: string;
  docName?: string;
  variant?: "default" | "grid";
  multiple?: boolean;
  onUploadSuccess: (data: { url: string; public_id: string; resource_type: string; name: string }) => void;
  onRemove?: () => void;
}

const ImageField = ({
  label,
  docName,
  variant = "default",
  multiple = false,
  onUploadSuccess,
  onRemove,
}: ImageFieldProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedPublicId, setUploadedPublicId] = useState<string | null>(null);
  const [uploadedResourceType, setUploadedResourceType] = useState<string>("image");
  const [uploading, setUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const { uploadFile, deleteFile } = useAuthStore();

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (uploadedPublicId) {
      deleteFile(uploadedPublicId, uploadedResourceType).catch((err) => {
        console.error("Failed to delete from Cloudinary:", err);
      });
    }

    setPreview(null);
    setUploadedPublicId(null);
    setIsUploaded(false);
    onRemove?.();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // If replacing an existing single upload, remove the old one from Cloudinary
    if (!multiple && uploadedPublicId) {
      deleteFile(uploadedPublicId, uploadedResourceType).catch((err) => {
        console.error("Failed to delete previous from Cloudinary:", err);
      });
    }

    setUploading(true);
    setIsUploaded(false);

    if (multiple) {
      const fileArray = Array.from(files);

      const uploadPromises = fileArray.map(async (file) => {
        try {
          const res = await uploadFile(file);
          if (res.success && res.url) {
            toast.success(`${file.name} uploaded`);
            onUploadSuccess({
              url: res.url,
              public_id: res.public_id || "",
              resource_type: res.resource_type || "image",
              name: docName || file.name,
            });
          } else {
            toast.error(res.message || `Upload failed for ${file.name}`);
          }
        } catch (error) {
          toast.error(`Upload failed for ${file.name}`);
        }
      });

      await Promise.all(uploadPromises);
      setUploading(false);
      if (variant === "grid") {
        setPreview(null);
        setIsUploaded(false);
      }
    } else {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);

      const res = await uploadFile(file);
      setUploading(false);

      if (res.success && res.url) {
        setIsUploaded(true);
        setUploadedPublicId(res.public_id || null);
        setUploadedResourceType(res.resource_type || "image");
        toast.success(`${label} uploaded`);
        onUploadSuccess({
          url: res.url,
          public_id: res.public_id || "",
          resource_type: res.resource_type || "image",
          name: docName || file.name,
        });

        if (variant === "grid") {
          setPreview(null);
          setIsUploaded(false);
        }
      } else {
        toast.error(res.message || "Upload failed");
        setPreview(null);
        setUploadedPublicId(null);
      }
    }
  };

  if (variant === "grid") {
    return (
      <div
        className={cn(
          "relative w-full aspect-square group border-2 border-dashed border-white/10 rounded-2xl transition-all flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/50",
          uploading && "pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center justify-center text-center p-2">
          <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">
            {label}
          </span>
        </div>

        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {uploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Field className="w-full">
      <FieldLabel className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </FieldLabel>
      <div
        className={cn(
          "relative group border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center min-h-[140px] bg-white/[0.02] border-white/10 hover:border-primary/40",
          isUploaded && "border-green-500/30 bg-green-500/[0.02]",
          uploading && "opacity-70 pointer-events-none"
        )}
      >
        {preview ? (
          <div className="relative flex flex-col items-center">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-white/10 mb-2"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow-lg hover:bg-red-600 transition-all z-10"
                title="Remove and delete image"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            {isUploaded && (
              <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold uppercase">
                <CheckCircle2 className="w-3 h-3" /> Uploaded
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <UploadCloud className="w-6 h-6 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
            <p className="text-xs text-muted-foreground font-medium">
              Click to upload
            </p>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {uploading && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
      </div>
    </Field>
  );
};

export default ImageField;