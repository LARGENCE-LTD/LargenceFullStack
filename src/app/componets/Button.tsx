import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  children,
  ...buttonProps
}) => (
  <button className={className} {...buttonProps}>
    {children}
  </button>
);
