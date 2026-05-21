import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { runTryOn } from "@/api/tryon";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GarmentStep from "@/components/wizard/GarmentStep";
import MeasurementForm from "@/components/wizard/MeasurementForm";
import PhotoUpload from "@/components/wizard/PhotoUpload";
import ResultStep from "@/components/wizard/ResultStep";
import WizardProgress from "@/components/wizard/WizardProgress";
import { cn } from "@/lib/utils";
import {
  WIZARD_STEPS,
  type Measurements,
  type TryOnResult,
  type WizardStep,
} from "@/types/tryon";

export default function TryOnPage() {
  const [step, setStep] = useState<WizardStep>(0);
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [result, setResult] = useState<TryOnResult | null>(null);

  const tryOnMutation = useMutation({
    mutationFn: () => {
      if (!personImage || !measurements || !garmentImage) {
        throw new Error("Missing required inputs");
      }
      return runTryOn(personImage, garmentImage, measurements);
    },
    onSuccess: (data) => {
      setResult(data);
      setStep(3);
    },
  });

  const canAdvance = (): boolean => {
    if (step === 0) return personImage !== null;
    if (step === 1) return measurements !== null;
    if (step === 2) return garmentImage !== null;
    return true;
  };

  const handleNext = () => {
    if (step === 2) {
      tryOnMutation.mutate();
      setStep(3);
      return;
    }
    setStep((s) => (s + 1) as WizardStep);
  };

  const handleBack = () => setStep((s) => (s - 1) as WizardStep);

  const stepTitle = WIZARD_STEPS[step];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 flex-1">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Virtual Try-On</h1>
        <p className="text-sm text-muted-foreground">
          {stepTitle.description}
        </p>
      </div>

      <WizardProgress currentStep={step} />

      <Card className="mt-6 p-6">
        <h2 className="text-base font-semibold mb-5">{stepTitle.label}</h2>

        {step === 0 && (
          <PhotoUpload
            label="Your photo"
            hint="Front-facing, good lighting. Your face and body should be clearly visible."
            value={personImage}
            onChange={setPersonImage}
          />
        )}

        {step === 1 && (
          <MeasurementForm value={measurements} onChange={setMeasurements} />
        )}

        {step === 2 && (
          <GarmentStep
            garmentImage={garmentImage}
            onGarmentImageChange={setGarmentImage}
          />
        )}

        {step === 3 && (
          <ResultStep
            result={result}
            isLoading={tryOnMutation.isPending}
          />
        )}
      </Card>

      {/* Navigation */}
      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "disabled:opacity-40"
          )}
        >
          Back
        </button>

        {step < 3 && (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance() || tryOnMutation.isPending}
            className={cn(
              buttonVariants(),
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            {step === 2 ? "Generate Try-On" : "Next"}
          </button>
        )}

        {step === 3 && !tryOnMutation.isPending && (
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setPersonImage(null);
              setMeasurements(null);
              setGarmentImage(null);
              setResult(null);
              tryOnMutation.reset();
            }}
            className={buttonVariants({ variant: "outline" })}
          >
            Start over
          </button>
        )}
      </div>

      {tryOnMutation.isError && (
        <p className="mt-3 text-center text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      )}
    </main>
  );
}
