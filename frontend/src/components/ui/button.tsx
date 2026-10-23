import { Button as HeroButton } from "@heroui/react";
import type { ComponentProps } from "react";

type ButtonProps = Omit<
    ComponentProps<typeof HeroButton>,
    "variant" | "size"
> & {
    variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
    disabled?: boolean;
};
const variants = {
    default: "primary",
    destructive: "danger",
    outline: "outline",
    secondary: "secondary",
    ghost: "ghost",
    link: "ghost",
} as const;
export function Button({
    variant = "default",
    size = "default",
    disabled,
    ...props
}: ButtonProps) {
    return (
        <HeroButton
            variant={variants[variant]}
            size={
                size === "sm" || size === "icon-sm"
                    ? "sm"
                    : size === "lg" || size === "icon-lg"
                      ? "lg"
                      : "md"
            }
            isIconOnly={size.startsWith("icon")}
            isDisabled={disabled}
            {...props}
        />
    );
}
