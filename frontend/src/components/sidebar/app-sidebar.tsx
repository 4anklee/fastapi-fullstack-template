import { Briefcase, House, Persons } from "@gravity-ui/icons";
import { cn } from "@heroui/react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Appearance } from "@/components/common/appearance";
import { Logo } from "@/components/common/logo";
import useAuth from "@/hooks/use-auth";
import { User } from "./user";

const links = [
    { icon: House, title: "Dashboard", to: "/" },
    { icon: Briefcase, title: "Items", to: "/items" },
    { icon: Persons, title: "Admin", to: "/admin", admin: true },
] as const;

export function AppSidebar({
    collapsed = false,
    onNavigate,
}: {
    collapsed?: boolean;
    onNavigate?: () => void;
}) {
    const { user } = useAuth();
    const path = useRouterState({ select: (state) => state.location.pathname });
    return (
        <>
            <div
                className={cn(
                    "flex px-4 py-6",
                    collapsed && "justify-center px-0",
                )}
            >
                <Logo
                    variant={collapsed ? "icon" : "full"}
                    className="text-sm"
                />
            </div>
            <nav
                aria-label="Main navigation"
                className="min-h-0 flex-1 overflow-y-auto p-2"
            >
                <ul className="space-y-1">
                    {links
                        .filter(
                            (item) => !("admin" in item) || user?.is_superuser,
                        )
                        .map((item) => (
                            <li key={item.to}>
                                <Link
                                    to={item.to}
                                    onClick={onNavigate}
                                    title={collapsed ? item.title : undefined}
                                    aria-label={item.title}
                                    aria-current={
                                        path === item.to ? "page" : undefined
                                    }
                                    className={cn(
                                        "button button--ghost w-full justify-start gap-3 px-3",
                                        collapsed && "justify-center px-0",
                                        path === item.to &&
                                            "bg-accent-soft text-accent-soft-foreground",
                                    )}
                                >
                                    <item.icon className="size-4 shrink-0" />
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            </li>
                        ))}
                </ul>
            </nav>
            <div className="flex flex-col gap-2 border-t p-2">
                <Appearance sidebar collapsed={collapsed} />
                <User
                    user={user}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                />
            </div>
        </>
    );
}
