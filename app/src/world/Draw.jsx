// PLACEHOLDER — replaced by the drawing board. Props: { onClose }.
export default function Draw({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-(--t-overlay)" dir="rtl">
      <p className="text-white font-black text-2xl">🎨 ציור — בקרוב</p>
      <button onClick={onClose} className="bg-white text-slate-800 font-black text-xl px-8 py-3 rounded-2xl border-b-4 border-slate-300">יציאה</button>
    </div>
  )
}
