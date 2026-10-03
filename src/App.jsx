import Wizard from './components/wizard/Wizard.jsx';

export default function App() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      <h1 className="mb-1 text-2xl font-bold text-primary">LendSwift loan application</h1>
      <p className="mb-6 text-sm text-slate-700">
        Your progress saves automatically on this device for 72 hours.
      </p>
      <Wizard />
    </main>
  );
}
