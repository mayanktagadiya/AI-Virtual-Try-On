import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStep } from "@/types/tryon";

interface WizardProgressProps {
  currentStep: WizardStep;
}

export default function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center">
        {WIZARD_STEPS.map((step, index) => {
          const stepIndex = index as WizardStep;
          const isCompleted = stepIndex < currentStep;
          const isCurrent = stepIndex === currentStep;

          return (
            <li
              key={step.label}
              className={cn("flex items-center", index < WIZARD_STEPS.length - 1 && "flex-1")}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-background text-muted-foreground"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "hidden sm:block text-xs font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 mb-5 h-0.5 flex-1 transition-colors",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
