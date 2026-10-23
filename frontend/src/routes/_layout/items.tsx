import { Magnifier as Search } from "@gravity-ui/icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { itemsListOptions } from "@/client/@tanstack/react-query.gen";
import { DataTable } from "@/components/common/data-table";
import AddItem from "@/components/items/add-item";
import { columns } from "@/components/items/columns";
import PendingItems from "@/components/pending/pending-items";
import { APP_NAME } from "@/config";

function getItemsQueryOptions() {
    return itemsListOptions({ query: { skip: 0, limit: 100 } });
}

export const Route = createFileRoute("/_layout/items")({
    component: Items,
    head: () => ({
        meta: [
            {
                title: `Items - ${APP_NAME}`,
            },
        ],
    }),
});

function ItemsTableContent() {
    const { data: items } = useSuspenseQuery(getItemsQueryOptions());

    if (items.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-default mb-4 rounded-full p-4">
                    <Search className="text-muted h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">
                    You don't have any items yet
                </h3>
                <p className="text-muted">Add a new item to get started</p>
            </div>
        );
    }

    return <DataTable columns={columns} data={items.data} />;
}

function ItemsTable() {
    return (
        <Suspense fallback={<PendingItems />}>
            <ItemsTableContent />
        </Suspense>
    );
}

function Items() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Items</h1>
                    <p className="text-muted">Create and manage your items</p>
                </div>
                <AddItem />
            </div>
            <ItemsTable />
        </div>
    );
}
