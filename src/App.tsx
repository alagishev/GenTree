import { GraphCanvas } from './components/GraphCanvas'

export default function App() {
  return (
    <div className="flex h-full flex-col bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
        Double-click the canvas to add a person. Drag from handle to handle to connect.
      </header>
      <div className="min-h-0 flex-1">
        <GraphCanvas />
      </div>
    </div>
  )
}
