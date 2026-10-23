import { Modal } from "@heroui/react";
import {
    type ComponentProps,
    cloneElement,
    type ReactElement,
    type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export function Dialog({
    open,
    onOpenChange,
    children,
}: {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}) {
    return (
        <Modal isOpen={open} onOpenChange={onOpenChange}>
            {children}
        </Modal>
    );
}
export function DialogTrigger({
    children,
}: {
    asChild?: boolean;
    children: ReactElement;
}) {
    return children;
}
export function DialogClose({
    children,
}: {
    asChild?: boolean;
    children: ReactElement<{ slot?: string }>;
}) {
    return cloneElement(children, { slot: "close" });
}
export function DialogContent({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <Modal.Backdrop>
            <Modal.Container>
                <Modal.Dialog className={cn("w-full", className)}>
                    <Modal.CloseTrigger />
                    {children}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
export const DialogTitle = Modal.Heading;
export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
    return <Modal.Header className={cn("gap-2 pr-6", className)} {...props} />;
}
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
    return <Modal.Footer className={cn("gap-2", className)} {...props} />;
}
export function DialogDescription({
    className,
    ...props
}: ComponentProps<"p">) {
    return <p className={cn("text-muted text-sm", className)} {...props} />;
}
