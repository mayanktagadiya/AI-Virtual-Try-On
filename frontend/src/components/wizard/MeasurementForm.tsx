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

type FieldKey = keyof FormFields;
type FieldErrors = Partial<Record<FieldKey, string>>;
type Touched = Partial<Record<FieldKey, boolean>>;

export default function MeasurementForm({ value, onChange }: MeasurementFormProps) {
  const [fields, setFields] = useState<FormFields>({
    height_cm: value?.height_cm?.toString() ?? "",
    weight_kg: value?.weight_kg?.toString() ?? "",
    body_type: value?.body_type ?? "",
    gender: value?.gender ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  const runValidation = (updated: FormFields): FieldErrors => {
    const result = MeasurementSchema.safeParse({
      height_cm: updated.height_cm === "" ? undefined : Number(updated.height_cm),
      weight_kg: updated.weight_kg === "" ? undefined : Number(updated.weight_kg),
      body_type: updated.body_type || undefined,
      gender: updated.gender || undefined,
    });

    if (result.success) {
      onChange(result.data);
      return {};
    }

    onChange(null);
    const fieldErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as FieldKey;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return fieldErrors;
  };

  const touch = (field: FieldKey) => {
    setTouched((prev) => {
      const next = { ...prev, [field]: true };
      // re-run validation so errors update immediately on blur
      const errs = runValidation(fields);
      setErrors(errs);
      return next;
    });
  };

  const update = (patch: Partial<FormFields>, touchField?: FieldKey) => {
    const updated = { ...fields, ...patch };
    setFields(updated);
    const errs = runValidation(updated);
    setErrors(errs);
    if (touchField) {
      setTouched((prev) => ({ ...prev, [touchField]: true }));
    }
  };

  const err = (field: FieldKey) =>
    touched[field] ? errors[field] : undefined;

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
            onBlur={() => touch("height_cm")}
            aria-invalid={!!err("height_cm")}
          />
          {err("height_cm") && (
            <p className="text-xs text-destructive">{err("height_cm")}</p>
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
            onBlur={() => touch("weight_kg")}
            aria-invalid={!!err("weight_kg")}
          />
          {err("weight_kg") && (
            <p className="text-xs text-destructive">{err("weight_kg")}</p>
          )}
        </div>
      </div>

      {/* Body type */}
      <div className="space-y-1.5">
        <Label>Body type</Label>
        <Select
          value={fields.body_type}
          onValueChange={(v) => update({ body_type: v ?? "" }, "body_type")}
        >
          <SelectTrigger aria-invalid={!!err("body_type")}>
            <SelectValue placeholder="Select body type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slim">Slim</SelectItem>
            <SelectItem value="athletic">Athletic</SelectItem>
            <SelectItem value="average">Average</SelectItem>
            <SelectItem value="heavier">Heavier</SelectItem>
          </SelectContent>
        </Select>
        {err("body_type") && (
          <p className="text-xs text-destructive">{err("body_type")}</p>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <Label>Gender</Label>
        <Select
          value={fields.gender}
          onValueChange={(v) => update({ gender: v ?? "" }, "gender")}
        >
          <SelectTrigger aria-invalid={!!err("gender")}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {err("gender") && (
          <p className="text-xs text-destructive">{err("gender")}</p>
        )}
      </div>
    </div>
  );
}
