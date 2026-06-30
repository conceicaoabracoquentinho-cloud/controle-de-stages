import type React from "react";
import { colors, inputStyle, space } from "../../styles/tokens";

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

/** Wrapper de rótulo + campo, padrão único para todos os formulários (4.15/7.10). */
export function Field({ label, required, children }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: space.field }}>
      <label style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>
        {label} {required && <span style={{ color: colors.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.blue;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        props.onBlur?.(e);
      }}
    />
  );
}
