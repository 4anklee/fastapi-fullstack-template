import { Link } from "@tanstack/react-router";
import { PencilLine } from "lucide-react";

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
                <PencilLine className="size-5 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
                    Handwriting Recognition
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
                <PencilLine className="size-5 shrink-0" aria-hidden="true" />
                {variant === "full" ? (
                    <span>Handwriting Recognition</span>
                ) : null}
            </div>
        );

    if (!asLink) {
        return content;
    }

    return (
        <Link to="/" aria-label="Handwriting Recognition">
            {content}
        </Link>
    );
}
