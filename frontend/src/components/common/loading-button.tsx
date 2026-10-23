import { Button, Spinner } from "@heroui/react";
import type { ComponentProps } from "react";

export function LoadingButton({
    loading = false,
    isDisabled,
    children,
    ...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
    loading?: boolean;
    children?: React.ReactNode;
}) {
    return (
        <Button
            {...props}
            isDisabled={isDisabled || loading}
            isPending={loading}
        >
            {loading && <Spinner size="sm" color="current" />}
            {children}
        </Button>
    );
}
