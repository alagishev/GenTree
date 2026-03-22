import { GraphCanvas } from './components/GraphCanvas'

export default function App() {
  return (
    <div className="flex h-full flex-col bg-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
        <span>
          Double-click the canvas to add a person. Drag from handle to handle to connect.
        </span>
        <a
          href="https://github.com/alagishev/GenTree"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-slate-900 hover:decoration-slate-500"
        >
          Source on GitHub
        </a>
      </header>
      <div className="min-h-0 flex-1">
        <GraphCanvas />
      </div>
    </div>
  )
}
