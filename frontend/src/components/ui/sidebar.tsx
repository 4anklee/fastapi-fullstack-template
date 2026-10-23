import { LayoutColumns } from "@gravity-ui/icons";
import { cn, Drawer, Tooltip } from "@heroui/react";
import {
    type ComponentProps,
    cloneElement,
    createContext,
    type ReactElement,
    type ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./button";

type SidebarState = {
    open: boolean;
    isMobile: boolean;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    toggleSidebar: () => void;
};
const SidebarContext = createContext<SidebarState | null>(null);
export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("Sidebar components require SidebarProvider");
    return context;
}
export function SidebarProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(true);
    const [openMobile, setOpenMobile] = useState(false);
    const isMobile = useIsMobile();
    const toggleSidebar = () =>
        isMobile
            ? setOpenMobile((value) => !value)
            : setOpen((value) => !value);
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                if (isMobile) setOpenMobile((value) => !value);
                else setOpen((value) => !value);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isMobile]);
    return (
        <SidebarContext
            value={{ open, isMobile, openMobile, setOpenMobile, toggleSidebar }}
        >
            <div className="flex min-h-svh w-full">{children}</div>
        </SidebarContext>
    );
}
export function Sidebar({
    children,
}: {
    children: ReactNode;
    collapsible?: "icon";
}) {
    const { open, isMobile, openMobile, setOpenMobile } = useSidebar();
    if (isMobile)
        return (
            <Drawer isOpen={openMobile} onOpenChange={setOpenMobile}>
                <Drawer.Backdrop>
                    <Drawer.Content placement="left" className="w-72">
                        <Drawer.Dialog
                            aria-label="Navigation"
                            className="flex h-full flex-col p-0"
                        >
                            <Drawer.CloseTrigger />
                            {children}
                        </Drawer.Dialog>
                    </Drawer.Content>
                </Drawer.Backdrop>
            </Drawer>
        );
    return (
        <aside
            aria-label="Navigation"
            data-collapsible={open ? undefined : "icon"}
            className={cn(
                "group bg-surface sticky top-0 flex h-svh shrink-0 flex-col border-r transition-[width]",
                open ? "w-64" : "w-16",
            )}
        >
            {children}
        </aside>
    );
}
export function SidebarInset({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex min-w-0 flex-1 flex-col", className)}
            {...props}
        />
    );
}
export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
    return <div className={cn("p-4", className)} {...props} />;
}
export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("min-h-0 flex-1 overflow-y-auto p-2", className)}
            {...props}
        />
    );
}
export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex flex-col gap-2 border-t p-2", className)}
            {...props}
        />
    );
}
export function SidebarGroup({ children }: { children: ReactNode }) {
    return <nav>{children}</nav>;
}
export function SidebarGroupContent({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
export function SidebarMenu({ children }: { children: ReactNode }) {
    return <ul className="flex flex-col gap-1">{children}</ul>;
}
export function SidebarMenuItem({ children }: { children: ReactNode }) {
    return <li className="list-none">{children}</li>;
}
export function SidebarMenuButton({
    children,
    asChild,
    isActive,
    tooltip,
    className,
    size,
    ...props
}: Omit<ComponentProps<typeof Button>, "size" | "children" | "className"> & {
    children: ReactNode;
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string;
    className?: string;
    size?: "lg";
}) {
    const classes = cn(
        "flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:[&>span:not(.sr-only)]:hidden [&>svg]:size-4 [&>svg]:shrink-0",
        isActive && "bg-accent-soft text-accent-soft-foreground",
        size === "lg" && "h-14",
        className,
    );
    if (asChild)
        return cloneElement(children as ReactElement<ComponentProps<"a">>, {
            className: cn(
                classes,
                "hover:bg-default focus-visible:outline-focus focus-visible:outline-2",
            ),
            "aria-current": isActive ? "page" : undefined,
            title: tooltip,
        });
    return (
        <Button variant="ghost" className={classes} {...props}>
            {children}
        </Button>
    );
}
export function SidebarTrigger({ className }: { className?: string }) {
    const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
    return (
        <Tooltip>
            <Button
                variant="ghost"
                size="icon"
                className={className}
                onPress={toggleSidebar}
                aria-label="Toggle sidebar"
                aria-expanded={isMobile ? openMobile : open}
            >
                <LayoutColumns />
            </Button>
            <Tooltip.Content>Toggle sidebar</Tooltip.Content>
        </Tooltip>
    );
}
