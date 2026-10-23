import { EllipsisVertical, Pencil, TrashBin } from "@gravity-ui/icons";
import { Dropdown, Label } from "@heroui/react";
import { useState } from "react";
import type { UserPublic } from "@/client";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/use-auth";
import DeleteUser from "./delete-user";
import EditUser from "./edit-user";

export function UserActionsMenu({ user }: { user: UserPublic }) {
    const [action, setAction] = useState<"edit" | "delete" | null>(null);
    const { user: currentUser } = useAuth();
    if (user.id === currentUser?.id) return null;
    return (
        <>
            <Dropdown>
                <Button variant="ghost" size="icon" aria-label="User actions">
                    <EllipsisVertical />
                </Button>
                <Dropdown.Popover placement="bottom end">
                    <Dropdown.Menu aria-label="User actions">
                        <Dropdown.Item
                            id="edit"
                            textValue="Edit User"
                            onAction={() => setAction("edit")}
                        >
                            <Pencil />
                            <Label>Edit User</Label>
                        </Dropdown.Item>
                        <Dropdown.Item
                            id="delete"
                            textValue="Delete User"
                            variant="danger"
                            onAction={() => setAction("delete")}
                        >
                            <TrashBin />
                            <Label>Delete User</Label>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
            <EditUser
                user={user}
                isOpen={action === "edit"}
                setIsOpen={(open) => setAction(open ? "edit" : null)}
            />
            <DeleteUser
                id={user.id}
                isOpen={action === "delete"}
                setIsOpen={(open) => setAction(open ? "delete" : null)}
            />
        </>
    );
}
