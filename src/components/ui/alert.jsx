import * as React from "react"

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={`rounded-lg border p-4 ${
      variant === "destructive" ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50"
    } ${className}`}
    {...props}
  />
))

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`mt-2 text-sm ${className}`}
    {...props}
  />
))

export { Alert, AlertDescription }