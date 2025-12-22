import { cn } from "../../lib/utils"

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={cn("w-full", className)} data-value={value}>
      {typeof children === 'function' ? children({ value, onValueChange }) : children}
    </div>
  )
}

export function TabsList({ className, children }) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 p-1", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, activeValue, onClick, className, children }) {
  const isActive = value === activeValue
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
        isActive ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, activeValue, className, children }) {
  if (value !== activeValue) return null
  return <div className={cn("mt-4", className)}>{children}</div>
}
