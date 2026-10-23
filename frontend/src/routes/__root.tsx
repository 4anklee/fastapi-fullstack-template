import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import ErrorComponent from "@/components/common/error-component";
import NotFound from "@/components/common/not-found";
import { APP_DESCRIPTION, APP_NAME } from "@/config";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { title: APP_NAME },
            { name: "description", content: APP_DESCRIPTION },
        ],
    }),
    component: () => (
        <>
            <HeadContent />
            <Outlet />
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools initialIsOpen={false} />
        </>
    ),
    notFoundComponent: () => <NotFound />,
    errorComponent: () => <ErrorComponent />,
});
