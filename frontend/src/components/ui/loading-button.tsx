import { Spinner } from "@heroui/react";
import type { ComponentProps } from "react";
import { Button } from "./button";

export function LoadingButton({
    loading = false,
    disabled,
    children,
    ...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
    loading?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <Button {...props} disabled={disabled || loading} isPending={loading}>
            {loading && <Spinner size="sm" color="current" />}
            {children}
        </Button>
    );
}
