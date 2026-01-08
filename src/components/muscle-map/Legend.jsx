// Cool→warm spectrum for intuitive progression
const LEVELS = [
  { label: 'Beginner', color: '#94A3B8', textColor: '#FFFFFF' },      // Slate grey
  { label: 'Novice', color: '#38BDF8', textColor: '#FFFFFF' },        // Sky blue
  { label: 'Intermediate', color: '#4ADE80', textColor: '#166534' },  // Green (dark text)
  { label: 'Advanced', color: '#FACC15', textColor: '#713F12' },      // Yellow (dark text)
  { label: 'Elite', color: '#FB923C', textColor: '#FFFFFF' },         // Orange
  { label: 'World Class', color: '#F43F5E', textColor: '#FFFFFF' },   // Rose/Red
]

export function Legend() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {LEVELS.map(({ label, color, textColor }) => (
        <span
          key={label}
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: color, color: textColor, minWidth: '80px', textAlign: 'center' }}
        >
          {label}
        </span>
      ))}
    </div>
  )
}
