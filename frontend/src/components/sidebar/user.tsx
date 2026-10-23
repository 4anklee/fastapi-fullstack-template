import { ArrowRightFromSquare, Gear } from "@gravity-ui/icons";
import { Avatar, Button, Dropdown, Label } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import type { UserPublic } from "@/client";
import useAuth from "@/hooks/use-auth";
import { getInitials } from "@/utils";

export function User({
    user,
    collapsed = false,
    onNavigate,
}: {
    user?: UserPublic;
    collapsed?: boolean;
    onNavigate?: () => void;
}) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    if (!user) return null;
    return (
        <Dropdown>
            <Button
                variant="ghost"
                isIconOnly={collapsed}
                className={
                    collapsed ? "w-full" : "h-14 w-full justify-start gap-3"
                }
                data-testid="user-menu"
                aria-label="User menu"
            >
                <Avatar size="sm" className="shrink-0">
                    <Avatar.Fallback>
                        {getInitials(user.full_name || "User")}
                    </Avatar.Fallback>
                </Avatar>
                {!collapsed && (
                    <span className="min-w-0 text-left">
                        <span className="block truncate font-medium">
                            {user.full_name || "My account"}
                        </span>
                        <span className="text-muted block truncate text-xs">
                            {user.email}
                        </span>
                    </span>
                )}
            </Button>
            <Dropdown.Popover placement="top start" className="min-w-56">
                <Dropdown.Menu aria-label="Account">
                    <Dropdown.Item
                        id="settings"
                        textValue="User Settings"
                        onAction={() => {
                            onNavigate?.();
                            return navigate({ to: "/settings" });
                        }}
                    >
                        <Gear />
                        <Label>User Settings</Label>
                    </Dropdown.Item>
                    <Dropdown.Item
                        id="logout"
                        textValue="Log Out"
                        onAction={logout}
                    >
                        <ArrowRightFromSquare />
                        <Label>Log Out</Label>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
