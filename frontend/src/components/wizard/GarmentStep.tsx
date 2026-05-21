import PhotoUpload from "./PhotoUpload";

interface GarmentStepProps {
  garmentImage: File | null;
  onGarmentImageChange: (file: File | null) => void;
}

export default function GarmentStep({
  garmentImage,
  onGarmentImageChange,
}: GarmentStepProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        Catalog browsing coming Day 4 — for now, upload a garment image directly.
      </div>

      <PhotoUpload
        label="Garment image"
        hint="Flat-lay or product shot works best — white/plain background preferred"
        value={garmentImage}
        onChange={onGarmentImageChange}
      />
    </div>
  );
}
