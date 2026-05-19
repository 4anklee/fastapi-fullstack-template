import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Suspense } from "react";

import { type UserPublic, usersReadMe } from "@/client";
import { usersListOptions } from "@/client/@tanstack/react-query.gen";
import AddUser from "@/components/admin/add-user";
import { columns, type UserTableData } from "@/components/admin/columns";
import { DataTable } from "@/components/common/data-table";
import PendingUsers from "@/components/pending/pending-users";
import useAuth from "@/hooks/use-auth";

function getUsersQueryOptions() {
    return usersListOptions({ query: { skip: 0, limit: 100 } });
}

export const Route = createFileRoute("/_layout/admin")({
    component: Admin,
    beforeLoad: async () => {
        const { data: user } = await usersReadMe({ throwOnError: true });
        if (!user.is_superuser) {
            throw redirect({
                to: "/",
            });
        }
    },
    head: () => ({
        meta: [
            {
                title: "Admin - Handwriting Recognition",
            },
        ],
    }),
});

function UsersTableContent() {
    const { user: currentUser } = useAuth();
    const { data: users } = useSuspenseQuery(getUsersQueryOptions());

    const tableData: UserTableData[] = users.data.map((user: UserPublic) => ({
        ...user,
        isCurrentUser: currentUser?.id === user.id,
    }));

    return <DataTable columns={columns} data={tableData} />;
}

function UsersTable() {
    return (
        <Suspense fallback={<PendingUsers />}>
            <UsersTableContent />
        </Suspense>
    );
}

function Admin() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-2xl tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage user accounts and permissions
                    </p>
                </div>
                <AddUser />
            </div>
            <UsersTable />
        </div>
    );
}
