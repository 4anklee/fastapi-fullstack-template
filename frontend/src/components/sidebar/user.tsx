import { ArrowRightFromSquare, Gear } from "@gravity-ui/icons";
import { Avatar, Dropdown, Label } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import type { UserPublic } from "@/client";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";
import { getInitials } from "@/utils";

export function User({ user }: { user?: UserPublic }) {
    const { logout } = useAuth();
    const { setOpenMobile } = useSidebar();
    const navigate = useNavigate();
    if (!user) return null;
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Dropdown>
                    <SidebarMenuButton
                        size="lg"
                        data-testid="user-menu"
                        aria-label="User menu"
                    >
                        <Avatar size="sm" className="shrink-0">
                            <Avatar.Fallback>
                                {getInitials(user.full_name || "User")}
                            </Avatar.Fallback>
                        </Avatar>
                        <span className="min-w-0 text-left">
                            <span className="block truncate font-medium">
                                {user.full_name || "My account"}
                            </span>
                            <span className="text-muted block truncate text-xs">
                                {user.email}
                            </span>
                        </span>
                    </SidebarMenuButton>
                    <Dropdown.Popover
                        placement="top start"
                        className="min-w-56"
                    >
                        <Dropdown.Menu aria-label="Account">
                            <Dropdown.Item
                                id="settings"
                                textValue="User Settings"
                                onAction={() => {
                                    setOpenMobile(false);
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
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
