import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "@/config";

import useAuth from "@/hooks/use-auth";

export const Route = createFileRoute("/_layout/")({
    component: Dashboard,
    head: () => ({
        meta: [
            {
                title: `Dashboard - ${APP_NAME}`,
            },
        ],
    }),
});

function Dashboard() {
    const { user: currentUser } = useAuth();

    return (
        <div>
            <div>
                <h1 className="max-w-sm truncate text-2xl">
                    Hi, {currentUser?.full_name || currentUser?.email} 👋
                </h1>
                <p className="text-muted">
                    Welcome to your full-stack starter.
                </p>
            </div>
        </div>
    );
}
