import { Layers } from "@gravity-ui/icons";
import { Link } from "@tanstack/react-router";
import { APP_NAME } from "@/config";

import { cn } from "@/lib/utils";

type LogoProps = {
    variant?: "full" | "icon" | "responsive";
    className?: string;
    asLink?: boolean;
};

export function Logo({
    variant = "full",
    className,
    asLink = true,
}: LogoProps) {
    const content =
        variant === "responsive" ? (
            <div className={cn("flex items-center gap-2", className)}>
                <Layers className="size-5 shrink-0" aria-hidden="true" />
                <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">
                    {APP_NAME}
                </span>
            </div>
        ) : (
            <div
                className={cn(
                    "flex items-center gap-2 font-semibold",
                    variant === "full" ? "text-lg" : "text-sm",
                    className,
                )}
            >
                <Layers className="size-5 shrink-0" aria-hidden="true" />
                {variant === "full" ? <span>{APP_NAME}</span> : null}
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
