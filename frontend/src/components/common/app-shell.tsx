import { LayoutColumns } from "@gravity-ui/icons";
import { Button, cn, Drawer, Tooltip } from "@heroui/react";
import { type ReactNode, useEffect, useState } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Footer } from "./footer";

export function AppShell({ children }: { children: ReactNode }) {
    const isMobile = useIsMobile();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const toggle = () =>
        isMobile
            ? setMobileOpen((open) => !open)
            : setCollapsed((value) => !value);
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                if (isMobile) setMobileOpen((open) => !open);
                else setCollapsed((value) => !value);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isMobile]);
    return (
        <div className="flex min-h-svh">
            {isMobile ? (
                <Drawer isOpen={mobileOpen} onOpenChange={setMobileOpen}>
                    <Drawer.Backdrop>
                        <Drawer.Content placement="left" className="w-72">
                            <Drawer.Dialog
                                aria-label="Navigation"
                                className="flex h-full flex-col p-0"
                            >
                                <Drawer.CloseTrigger />
                                <AppSidebar
                                    onNavigate={() => setMobileOpen(false)}
                                />
                            </Drawer.Dialog>
                        </Drawer.Content>
                    </Drawer.Backdrop>
                </Drawer>
            ) : (
                <aside
                    aria-label="Navigation"
                    className={cn(
                        "bg-surface sticky top-0 flex h-svh shrink-0 flex-col border-r transition-[width]",
                        collapsed ? "w-16" : "w-64",
                    )}
                >
                    <AppSidebar collapsed={collapsed} />
                </aside>
            )}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center border-b px-4">
                    <Tooltip>
                        <Button
                            isIconOnly
                            variant="ghost"
                            onPress={toggle}
                            aria-label="Toggle sidebar"
                            aria-expanded={isMobile ? mobileOpen : !collapsed}
                        >
                            <LayoutColumns />
                        </Button>
                        <Tooltip.Content>Toggle sidebar</Tooltip.Content>
                    </Tooltip>
                </header>
                <main className="flex-1 p-6 md:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
                <Footer />
            </div>
        </div>
    );
}
