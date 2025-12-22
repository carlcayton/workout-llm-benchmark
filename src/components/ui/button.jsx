import { cn } from "../../lib/utils"

export function Button({ className, variant = "default", size = "default", ...props }) {
  const variants = {
    default: "bg-zinc-900 text-white hover:bg-zinc-800",
    outline: "border border-zinc-300 bg-transparent hover:bg-zinc-100",
    ghost: "hover:bg-zinc-100",
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6",
  }
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
