"use client";

import { Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";


export default function BuildYourCrushSection() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [backstory, setBackstory] = useState("");
  const [personality, setPersonality] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - photos.length);
      setPhotos([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a name or nickname");
      return;
    }

    setIsSubmitting(true);

    try {
      let avatarBase64: string | undefined;
      let imageUrls: string[] = [];
      let imageBase64s: string[] = [];

      if (photos.length > 0) {
        console.log(`[Form] Uploading ${photos.length} image(s) to Blob Storage...`);
        setIsUploadingImages(true);

        try {
          const formData = new FormData();
          photos.forEach((photo) => {
            formData.append("images", photo);
          });

          const uploadResponse = await fetch("/api/upload-images", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({
              error: "Failed to upload images",
            }));
            throw new Error(errorData.error || "Image upload failed");
          }

          const uploadResult = await uploadResponse.json();

          if (uploadResult.images && uploadResult.images.length > 0) {
            avatarBase64 = uploadResult.images[0].base64;
            imageUrls = uploadResult.images.map((img: { url: string }) => img.url);
            imageBase64s = uploadResult.images
              .map((img: { base64?: string }) => img.base64)
              .filter((b: string | undefined): b is string => !!b);
          } else {
            imageUrls = uploadResult.urls || [];
            avatarBase64 = imageUrls[0];
          }

          console.log(`[Form] Images uploaded successfully:`, {
            count: imageUrls.length,
            hasBase64Avatar: !!avatarBase64,
          });
        } catch (uploadError) {
          console.error("[Form] Image upload error:", uploadError);
          throw new Error(
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload images. Please try again.",
          );
        } finally {
          setIsUploadingImages(false);
        }
      }

      console.log(`[Form] Creating character "${name}"...`);

      const response = await fetch("/api/create-crush", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          backstory: backstory.trim() || undefined,
          personality: personality.trim() || undefined,
          avatarUrl: avatarBase64,
          avatarBase64: avatarBase64,
          imageUrls: imageUrls,
          imageBase64s: imageBase64s.length > 0 ? imageBase64s : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to create character" }));
        throw new Error(errorData.error || "Something went wrong");
      }

      const result = await response.json();

      console.log(`[Form] Character created successfully:`, {
        characterId: result.characterId,
        sessionId: result.sessionId,
      });

      const params = new URLSearchParams({
        characterId: result.characterId,
        sessionId: result.sessionId,
        name: name.trim(),
      });

      router.push(`/connecting?${params.toString()}`);
    } catch (err) {
      console.error("[Form] Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create your crush. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  return (
    <div className="flex w-full flex-col lg:w-auto lg:flex-1 lg:max-w-lg xl:max-w-xl lg:shrink-0">
      <div className="relative w-full rounded-2xl p-6">
        {/* Subtle inner shadow */}
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

        <div className="relative space-y-6 sm:space-y-7 lg:space-y-6 xl:space-y-8">

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white/90"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your crush's name"
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 focus:outline-hidden"
                  required
                />
            </div>

            <div className="space-y-2">
                <label
                  htmlFor="personality"
                  className="block text-sm font-medium text-white/90"
                >
                  Personality
                </label>
                <textarea
                  id="personality"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Describe your crush. What makes them unique? What do they like to do? How do they write messages?"
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 focus:outline-hidden resize-none"
                />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-white/90">
                Add photos
              </p>

                {photos.length < 5 && (
                  <label
                    htmlFor="photos"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-8 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <Upload className="mb-2 size-8 text-white/30 transition-colors group-hover:text-white/50" />
                    <p className="text-sm text-white/50">
                      Click to upload{" "}
                      {photos.length > 0
                        ? `(${5 - photos.length} more)`
                        : "photos"}
                    </p>
                    <p className="text-xs text-white/30 mt-1">
                      JPG, PNG up to 10MB each
                    </p>
                    <input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}

                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={`${photo.name}-${photo.lastModified}`}
                        className="group relative size-20 overflow-hidden rounded-lg border border-white/10"
                      >
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 rounded-md bg-black/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="size-3 text-white" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 rounded bg-pink-500/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            Avatar
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="space-y-2">
                <label
                  htmlFor="backstory"
                  className="block text-sm font-medium text-white/90"
                >
                  How do you know each other?
                </label>
                <input
                  type="text"
                  id="backstory"
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="Met in college, always joked about running away together."
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20                   focus:outline-hidden"
                />
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
            )}

            <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingImages}
                  size="lg"
                  className="h-12 w-full bg-gradient-to-b from-pink-500 to-pink-600 text-base font-semibold shadow-lg hover:from-pink-400 hover:to-pink-500 disabled:opacity-50"
                >
                  {isUploadingImages
                    ? "Uploading images..."
                    : isSubmitting
                    ? "Creating..."
                    : "Create My Crush"}
                </Button>

                <p className="text-center text-xs text-white/40">
                  {photos.length > 0 && !isSubmitting && !isUploadingImages && (
                    <span className="block text-pink-400 mb-1">
                      {photos.length} photo{photos.length > 1 ? "s" : ""} ready to upload
                    </span>
                  )}
                </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
