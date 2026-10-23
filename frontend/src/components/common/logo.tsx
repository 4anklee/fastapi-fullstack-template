import { Layers } from "@gravity-ui/icons";
import { cn } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { APP_NAME } from "@/config";

type LogoProps = {
    variant?: "full" | "icon";
    className?: string;
    asLink?: boolean;
};

export function Logo({
    variant = "full",
    className,
    asLink = true,
}: LogoProps) {
    const content = (
        <div
            className={cn(
                "flex items-center gap-2 font-semibold",
                variant === "full" ? "text-lg" : "text-sm",
                className,
            )}
        >
            <Layers className="size-5 shrink-0" aria-hidden="true" />
            {variant === "full" && <span>{APP_NAME}</span>}
        </div>
    );

    if (!asLink) {
        return content;
    }

    return (
        <Link to="/" aria-label={APP_NAME}>
            {content}
        </Link>
    );
}
