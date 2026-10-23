import { EllipsisVertical, Pencil, TrashBin } from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import { useState } from "react";
import type { ItemPublic } from "@/client";
import DeleteItem from "./delete-item";
import EditItem from "./edit-item";

export function ItemActionsMenu({ item }: { item: ItemPublic }) {
    const [action, setAction] = useState<"edit" | "delete" | null>(null);

    return (
        <>
            <Dropdown>
                <Button variant="ghost" isIconOnly aria-label="Item actions">
                    <EllipsisVertical />
                </Button>
                <Dropdown.Popover placement="bottom end">
                    <Dropdown.Menu aria-label="Item actions">
                        <Dropdown.Item
                            id="edit"
                            textValue="Edit Item"
                            onAction={() => setAction("edit")}
                        >
                            <Pencil />
                            <Label>Edit Item</Label>
                        </Dropdown.Item>
                        <Dropdown.Item
                            id="delete"
                            textValue="Delete Item"
                            variant="danger"
                            onAction={() => setAction("delete")}
                        >
                            <TrashBin />
                            <Label>Delete Item</Label>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
            <EditItem
                item={item}
                isOpen={action === "edit"}
                setIsOpen={(open) => setAction(open ? "edit" : null)}
            />
            <DeleteItem
                id={item.id}
                isOpen={action === "delete"}
                setIsOpen={(open) => setAction(open ? "delete" : null)}
            />
        </>
    );
}
