// src/components/ui/Button.tsx
import { ReactNode } from "react";

type ButtonVariant = "primary" | "accent" | "ghost" | "outline-white";
type ButtonSize = "sm" | "md";

interface ButtonProps {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    href?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-primary text-primary-foreground hover:shadow-[0_10px_24px_rgba(0,0,0,0.25)]",
    accent: "bg-accent text-accent-foreground hover:shadow-[0_12px_28px_rgba(116,68,253,0.4)]",
    ghost: "bg-transparent text-heading border border-border hover:border-heading",
    "outline-white": "bg-transparent text-white border border-white/40 hover:bg-white/12",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "px-[22px] py-[10px] text-sm",
    md: "px-[30px] py-[14px] text-[15px]",
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    className = "",
    href,
    icon,
    iconPosition = "left",
}: ButtonProps) {
    const baseClasses =
        "inline-flex items-center justify-center gap-2 font-bold border-none cursor-pointer transition-all duration-300 ease-out whitespace-nowrap rounded-[--radius-btn] hover:-translate-y-[2px]";

    // دمج الكلاسات بشكل بسيط
    const classes = [
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const content = (
        <>
            {icon && iconPosition === "left" && icon}
            {children}
            {icon && iconPosition === "right" && icon}
        </>
    );

    if (href) {
        return <a href={href} className={classes}>{content}</a>;
    }

    return <button className={classes}>{content}</button>;
}