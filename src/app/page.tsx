import { LifecycleSteps } from "@/components/LifecycleSteps";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Agentic SDLC starter</h1>
      <p className="mt-3 opacity-80">
        Linear tickets become specs, designs, code, tests and deploys, with a person approving each gate.
      </p>
      <div className="mt-10">
        <LifecycleSteps />
      </div>
    </main>
  );
}
