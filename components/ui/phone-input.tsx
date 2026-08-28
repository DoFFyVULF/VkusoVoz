"use client"

import * as React from "react"
import { Input, type InputProps } from "./input"

function formatPhone(value: string): string {
  let d = value.replace(/\D/g, "").slice(0, 11)
  if (!d) return ""
  if (d[0] === "8") d = "7" + d.slice(1)
  if (d[0] !== "7") d = "7" + d.slice(0, 10)
  d = d.slice(0, 11)
  if (d.length === 1) return "+7"
  if (d.length <= 4) return `+7 (${d.slice(1)}`
  if (d.length <= 7) return `+7 (${d.slice(1, 4)}) ${d.slice(4)}`
  if (d.length <= 9) return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
  return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`
}

export interface PhoneInputProps extends Omit<InputProps, "value" | "onChange" | "type"> {
  value: string
  onChange: (value: string) => void
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = "+7 (999) 123-45-67", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value)
      onChange(formatted)
    }

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { PhoneInput, formatPhone }
