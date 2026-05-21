import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeasurementSchema, type Measurements } from "@/types/tryon";

interface MeasurementFormProps {
  value: Measurements | null;
  onChange: (data: Measurements | null) => void;
}

type FormFields = {
  height_cm: string;
  weight_kg: string;
  body_type: string;
  gender: string;
};

type FieldErrors = Partial<Record<keyof FormFields, string>>;

export default function MeasurementForm({
  value,
  onChange,
}: MeasurementFormProps) {
  const [fields, setFields] = useState<FormFields>({
    height_cm: value?.height_cm?.toString() ?? "",
    weight_kg: value?.weight_kg?.toString() ?? "",
    body_type: value?.body_type ?? "",
    gender: value?.gender ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (updated: FormFields): boolean => {
    const result = MeasurementSchema.safeParse({
      height_cm: Number(updated.height_cm),
      weight_kg: Number(updated.weight_kg),
      body_type: updated.body_type || undefined,
      gender: updated.gender || undefined,
    });

    if (result.success) {
      setErrors({});
      onChange(result.data);
      return true;
    }

    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FieldErrors;
      fieldErrors[key] = issue.message;
    }
    setErrors(fieldErrors);
    onChange(null);
    return false;
  };

  const update = (patch: Partial<FormFields>) => {
    const updated = { ...fields, ...patch };
    setFields(updated);
    validate(updated);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Height */}
        <div className="space-y-1.5">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="175"
            min={100}
            max={250}
            value={fields.height_cm}
            onChange={(e) => update({ height_cm: e.target.value })}
            aria-invalid={!!errors.height_cm}
          />
          {errors.height_cm && (
            <p className="text-xs text-destructive">{errors.height_cm}</p>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="70"
            min={30}
            max={300}
            value={fields.weight_kg}
            onChange={(e) => update({ weight_kg: e.target.value })}
            aria-invalid={!!errors.weight_kg}
          />
          {errors.weight_kg && (
            <p className="text-xs text-destructive">{errors.weight_kg}</p>
          )}
        </div>
      </div>

      {/* Body type */}
      <div className="space-y-1.5">
        <Label>Body type</Label>
        <Select
          value={fields.body_type}
          onValueChange={(v) => update({ body_type: v ?? "" })}
        >
          <SelectTrigger aria-invalid={!!errors.body_type}>
            <SelectValue placeholder="Select body type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slim">Slim</SelectItem>
            <SelectItem value="athletic">Athletic</SelectItem>
            <SelectItem value="average">Average</SelectItem>
            <SelectItem value="heavier">Heavier</SelectItem>
          </SelectContent>
        </Select>
        {errors.body_type && (
          <p className="text-xs text-destructive">{errors.body_type}</p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <Label>Gender</Label>
        <Select
          value={fields.gender}
          onValueChange={(v) => update({ gender: v ?? "" })}
        >
          <SelectTrigger aria-invalid={!!errors.gender}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-xs text-destructive">{errors.gender}</p>
        )}
      </div>
    </div>
  );
}
