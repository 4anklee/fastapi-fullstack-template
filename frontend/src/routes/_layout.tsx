import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/common/app-shell";
import { isLoggedIn } from "@/hooks/use-auth";

export const Route = createFileRoute("/_layout")({
    component: Layout,
    beforeLoad: async () => {
        if (!isLoggedIn()) {
            throw redirect({
                to: "/login",
            });
        }
    },
});

function Layout() {
    return (
        <AppShell>
            <Outlet />
        </AppShell>
    );
}
