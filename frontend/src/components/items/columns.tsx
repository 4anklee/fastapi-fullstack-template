import type { ColumnDef } from "@tanstack/react-table";
import { Check, Copy } from "lucide-react";

import type { ItemPublic } from "@/client";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { ItemActionsMenu } from "./item-actions-menu";

function CopyId({ id }: { id: string }) {
    const [copiedText, copy] = useCopyToClipboard();
    const isCopied = copiedText === id;

    return (
        <div className="group flex items-center gap-1.5">
            <span className="font-mono text-muted-foreground text-xs">
                {id}
            </span>
            <Button
                variant="ghost"
                size="icon"
                className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => copy(id)}
            >
                {isCopied ? (
                    <Check className="size-3 text-green-500" />
                ) : (
                    <Copy className="size-3" />
                )}
                <span className="sr-only">Copy ID</span>
            </Button>
        </div>
    );
}

export const columns: ColumnDef<ItemPublic>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <CopyId id={row.original.id} />,
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.title}</span>
        ),
    },
    {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
            const description = row.original.description;
            return (
                <span
                    className={cn(
                        "block max-w-xs truncate text-muted-foreground",
                        !description && "italic",
                    )}
                >
                    {description || "No description"}
                </span>
            );
        },
    },
    {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end">
                <ItemActionsMenu item={row.original} />
            </div>
        ),
    },
];
