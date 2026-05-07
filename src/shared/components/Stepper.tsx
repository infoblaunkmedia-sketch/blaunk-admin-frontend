import React from 'react';

export type Step = {
  label: string;
  description?: string;
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => (
  <nav aria-label="Form steps" className="mb-6 flex items-start justify-between">
    {steps.map((step, idx) => {
      const state =
        idx < currentStep ? 'done' : idx === currentStep ? 'active' : 'pending';
      return (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition',
                state === 'done'
                  ? 'bg-emerald-500 text-white'
                  : state === 'active'
                  ? 'bg-primary text-white'
                  : 'border-2 border-slate-300 bg-white text-slate-400',
              ].join(' ')}
            >
              {state === 'done' ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                idx + 1
              )}
            </div>
            <span
              className={[
                'max-w-[6rem] text-[11px] font-semibold leading-tight',
                state === 'active' ? 'text-primary' : state === 'done' ? 'text-emerald-600' : 'text-slate-400',
              ].join(' ')}
            >
              {step.label}
            </span>
          </div>

          {idx < steps.length - 1 && (
            <div
              className={[
                'mt-4 flex-1 border-t-2 mx-2',
                idx < currentStep ? 'border-emerald-400' : 'border-slate-200',
              ].join(' ')}
            />
          )}
        </React.Fragment>
      );
    })}
  </nav>
);
