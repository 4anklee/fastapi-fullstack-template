import { Check, Copy } from "@gravity-ui/icons";
import { Tooltip } from "@heroui/react";
import type { ItemPublic } from "@/client";
import type { DataColumn } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { ItemActionsMenu } from "./item-actions-menu";

function CopyId({ id }: { id: string }) {
    const [copiedText, copy] = useCopyToClipboard();
    const isCopied = copiedText === id;

    return (
        <div className="group flex items-center gap-1.5">
            <span className="text-muted font-mono text-xs whitespace-nowrap">
                {id}
            </span>
            <Tooltip>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 opacity-60 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                    onPress={() => copy(id)}
                >
                    {isCopied ? (
                        <Check className="size-3 text-green-500" />
                    ) : (
                        <Copy className="size-3" />
                    )}
                    <span className="sr-only">Copy ID</span>
                </Button>
                <Tooltip.Content>
                    {isCopied ? "Copied" : "Copy ID"}
                </Tooltip.Content>
            </Tooltip>
        </div>
    );
}

export const columns: DataColumn<ItemPublic>[] = [
    {
        id: "id",
        header: "ID",
        cell: (row) => <CopyId id={row.id} />,
    },
    {
        id: "title",
        header: "Title",
        cell: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
        id: "description",
        header: "Description",
        cell: (row) => {
            const description = row.description;
            return (
                <span
                    className={cn(
                        "text-muted block max-w-xs truncate",
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
        header: <span className="sr-only">Actions</span>,
        cell: (row) => (
            <div className="flex justify-end">
                <ItemActionsMenu item={row} />
            </div>
        ),
    },
];
