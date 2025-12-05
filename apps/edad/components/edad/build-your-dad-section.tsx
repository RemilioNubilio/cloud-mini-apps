"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function BuildYourDadSection() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [backstory, setBackstory] = useState("");
  const [aboutYou, setAboutYou] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - photos.length);
      setPhotos([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("Please tell us what Dad should call you");
      return;
    }

    setIsSubmitting(true);

    try {
      // STEP 1: Upload images (if provided)
      let avatarUrl: string | undefined;
      let imageUrls: string[] = [];

      if (photos.length > 0) {
        console.log(`[Form] Uploading ${photos.length} image(s)...`);
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
          imageUrls = uploadResult.urls || [];
          avatarUrl = imageUrls[0]; // Use first image as avatar

          console.log(`[Form] ✅ Images uploaded successfully:`, {
            count: imageUrls.length,
            avatarUrl,
          });
        } catch (uploadError) {
          console.error("[Form] ❌ Image upload error:", uploadError);
          throw new Error(
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload images. Please try again."
          );
        } finally {
          setIsUploadingImages(false);
        }
      }

      // STEP 2: Create character with image URLs
      console.log(`[Form] Creating dad "${nickname}"...`);

      const response = await fetch("/api/create-dad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: nickname.trim(),
          backstory: backstory.trim() || undefined,
          aboutYou: aboutYou.trim() || undefined,
          avatarUrl: avatarUrl,
          imageUrls: imageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to create character" }));
        throw new Error(errorData.error || "Something went wrong");
      }

      const result = await response.json();

      console.log(`[Form] ✅ Dad created successfully:`, {
        characterId: result.characterId,
        sessionId: result.sessionId,
      });

      // STEP 3: Redirect to connecting page with query params
      const params = new URLSearchParams({
        characterId: result.characterId,
        sessionId: result.sessionId,
        nickname: nickname.trim(),
      });

      router.push(`/connecting?${params.toString()}`);
    } catch (err) {
      console.error("[Form] ❌ Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create your dad. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingImages(false);
    }
  };

  return (
    <section
      id="build-your-dad"
      className="relative overflow-hidden py-20 sm:py-24"
    >
      <div className="mx-auto max-w-2xl px-4">
        {/* Card with site-consistent styling */}
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.02] to-white/[0.01] p-8 shadow-2xl backdrop-blur-sm sm:p-10">
          {/* Subtle inner shadow for depth */}
          <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

          <div className="relative space-y-8">
            {/* Header */}
            <div className="space-y-3 text-center">
              <h2 className="text-3xl leading-tight font-bold text-balance text-white sm:text-4xl">
                Create Your AI Dad
              </h2>
              <p className="text-base text-balance text-white/60 sm:text-lg">
                Tell us a bit about yourself and what kind of dad you'd like.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nickname Input */}
              <div className="space-y-2">
                <label
                  htmlFor="nickname"
                  className="block text-sm font-medium text-white/90"
                >
                  What should Dad call you?{" "}
                  <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Champ / Kiddo / Sport / Your name"
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-hidden"
                  required
                />
                <p className="text-xs text-white/40">
                  This is how your AI dad will address you.
                </p>
              </div>

              {/* About You Section */}
              <div className="space-y-4 rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-medium text-white/90">
                    Tell Dad about yourself
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    Share what's on your mind, your goals, or what you need support with
                  </p>
                </div>

                <textarea
                  id="aboutYou"
                  value={aboutYou}
                  onChange={(e) => setAboutYou(e.target.value)}
                  placeholder="I'm working on starting my own business... / I've been struggling with confidence lately... / I just want someone to share good news with..."
                  rows={4}
                  maxLength={1000}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-hidden resize-none"
                />
                <div className="flex items-center justify-between text-xs">
                  <p className="text-white/40">
                    This helps Dad understand how to support you best
                  </p>
                  <p
                    className={`${aboutYou.length > 900 ? "text-amber-400" : "text-white/40"}`}
                  >
                    {aboutYou.length}/1000
                  </p>
                </div>
              </div>

              {/* Optional Photos */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-white/90">
                  Optional: Give Dad a face
                </p>
                <p className="text-xs text-white/40">
                  Upload 1–3 photos to personalize your AI dad's appearance
                </p>

                {photos.length < 3 && (
                  <label
                    htmlFor="photos"
                    className="group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-white/[0.02] px-6 py-8 transition-all hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <Upload className="mb-2 size-8 text-white/30 transition-colors group-hover:text-white/50" />
                    <p className="text-sm text-white/50">
                      Click to upload{" "}
                      {photos.length > 0
                        ? `(${3 - photos.length} more)`
                        : "photos"}
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

                {/* Photo Previews */}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Backstory */}
              <div className="space-y-2">
                <label
                  htmlFor="backstory"
                  className="block text-sm font-medium text-white/90"
                >
                  Optional: What kind of relationship do you want?
                </label>
                <input
                  type="text"
                  id="backstory"
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="A dad who helps me with career decisions / Someone to share my wins with"
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-white placeholder-white/30 backdrop-blur-sm transition-colors hover:border-white/20 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 focus:outline-hidden"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploadingImages}
                  size="lg"
                  className="h-12 w-full bg-gradient-to-b from-amber-500 to-amber-600 text-base font-semibold shadow-lg hover:from-amber-400 hover:to-amber-500 disabled:opacity-50"
                >
                  {isUploadingImages
                    ? "Uploading images..."
                    : isSubmitting
                      ? "Creating your dad..."
                      : "Meet Your AI Dad"}
                </Button>

                <p className="text-center text-xs text-white/40">
                  {photos.length > 0 && !isSubmitting && !isUploadingImages && (
                    <span className="block text-amber-400 mb-1">
                      ✓ {photos.length} image{photos.length > 1 ? "s" : ""} ready
                      to upload
                    </span>
                  )}
                  Next: you'll be connected to ElizaOS Cloud for your private
                  chat.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

