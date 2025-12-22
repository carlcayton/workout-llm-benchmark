import { cn } from "../../lib/utils"

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "flex h-10 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
