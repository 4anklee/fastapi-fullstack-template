import { Chip } from "@heroui/react";

import type { UserPublic } from "@/client";
import type { DataColumn } from "@/components/common/data-table";
import { cn } from "@/lib/utils";
import { UserActionsMenu } from "./user-actions-menu";

export type UserTableData = UserPublic & {
    isCurrentUser: boolean;
};

export const columns: DataColumn<UserTableData>[] = [
    {
        id: "full_name",
        header: "Full Name",
        cell: (row) => {
            const fullName = row.full_name;
            return (
                <div className="flex items-center gap-2">
                    <span
                        className={cn("font-medium", !fullName && "text-muted")}
                    >
                        {fullName || "N/A"}
                    </span>
                    {row.isCurrentUser && (
                        <Chip size="sm" variant="soft" className="text-xs">
                            You
                        </Chip>
                    )}
                </div>
            );
        },
    },
    {
        id: "email",
        header: "Email",
        cell: (row) => <span className="text-muted">{row.email}</span>,
    },
    {
        id: "is_superuser",
        header: "Role",
        cell: (row) => (
            <Chip size="sm" color={row.is_superuser ? "accent" : "default"}>
                {row.is_superuser ? "Superuser" : "User"}
            </Chip>
        ),
    },
    {
        id: "is_active",
        header: "Status",
        cell: (row) => (
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        "size-2 rounded-full",
                        row.is_active ? "bg-green-500" : "bg-gray-400",
                    )}
                />
                <span className={row.is_active ? "" : "text-muted"}>
                    {row.is_active ? "Active" : "Inactive"}
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        header: <span className="sr-only">Actions</span>,
        cell: (row) => (
            <div className="flex justify-end">
                <UserActionsMenu user={row} />
            </div>
        ),
    },
];
