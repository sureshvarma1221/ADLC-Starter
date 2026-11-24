export const STEPS = [
  {
    id: "spec",
    title: "Spec + design",
    detail: "Claude reads the Linear ticket, writes a spec and a clickable prototype.",
    gate: "You approve the spec",
  },
  {
    id: "build",
    title: "Build + test",
    detail: "Claude implements the UI and writes unit and end-to-end tests for every acceptance criterion.",
    gate: null,
  },
  {
    id: "ship",
    title: "Pull request + preview",
    detail: "Claude opens the PR; Vercel builds a preview deploy.",
    gate: "You review and merge",
  },
  {
    id: "deploy",
    title: "Production",
    detail: "Merging to main deploys to production and closes the Linear ticket.",
    gate: null,
  },
] as const;

export function LifecycleSteps() {
  return (
    <ol aria-label="Delivery lifecycle" className="grid gap-4 sm:grid-cols-2">
      {STEPS.map((step, i) => (
        <li
          key={step.id}
          data-testid={`step-${step.id}`}
          className="rounded-xl border border-black/10 p-5 dark:border-white/15"
        >
          <p className="font-mono text-xs opacity-60">Step {i + 1}</p>
          <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
          <p className="mt-2 text-sm opacity-80">{step.detail}</p>
          {step.gate && (
            <p className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
              Human gate: {step.gate}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
