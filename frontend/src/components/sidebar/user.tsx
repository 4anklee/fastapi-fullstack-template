import { Link as RouterLink } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import type { UserPublic } from "@/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/use-auth";
import { getInitials } from "@/utils";

type UserInfoProps = {
    fullName?: string;
    email?: string;
};

function UserInfo({ fullName, email }: UserInfoProps) {
    return (
        <div className="flex w-full min-w-0 items-center gap-2.5">
            <Avatar className="size-8">
                <AvatarFallback className="bg-zinc-600 text-white">
                    {getInitials(fullName || "User")}
                </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col items-start">
                <p className="w-full truncate font-medium text-sm">
                    {fullName}
                </p>
                <p className="w-full truncate text-muted-foreground text-xs">
                    {email}
                </p>
            </div>
        </div>
    );
}

export function User({ user }: { user?: UserPublic }) {
    const { logout } = useAuth();
    const { isMobile, setOpenMobile } = useSidebar();

    if (!user) return null;

    const handleMenuClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };
    const handleLogout = async () => {
        logout();
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            data-testid="user-menu"
                        >
                            <UserInfo
                                fullName={user?.full_name ?? ""}
                                email={user?.email}
                            />
                            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <UserInfo
                                fullName={user?.full_name ?? ""}
                                email={user?.email}
                            />
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <RouterLink to="/settings" onClick={handleMenuClick}>
                            <DropdownMenuItem>
                                <Settings />
                                User Settings
                            </DropdownMenuItem>
                        </RouterLink>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
