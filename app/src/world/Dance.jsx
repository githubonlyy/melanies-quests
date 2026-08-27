// PLACEHOLDER — replaced by the rhythm dance game. Props: { onClose }.
import Avatar from '../avatar/Avatar.jsx'

export default function Dance({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-(--t-overlay)" dir="rtl">
      <Avatar size={260} className="anim-float-bob" />
      <p className="text-white font-black text-2xl">💃 ריקוד — בקרוב</p>
      <button onClick={onClose} className="bg-white text-slate-800 font-black text-xl px-8 py-3 rounded-2xl border-b-4 border-slate-300">יציאה</button>
    </div>
  )
}
