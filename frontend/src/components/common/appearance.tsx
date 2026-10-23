import { Display, Moon, Sun } from "@gravity-ui/icons";
import { Dropdown, Label } from "@heroui/react";
import { type Theme, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const icons = { system: Display, light: Sun, dark: Moon };
function ThemeMenu({ sidebar = false }: { sidebar?: boolean }) {
    const { setTheme, theme } = useTheme();
    const Icon = icons[theme];
    return (
        <Dropdown>
            {sidebar ? (
                <SidebarMenuButton
                    data-testid="theme-button"
                    aria-label="Toggle theme"
                >
                    <Icon />
                    <span>Appearance</span>
                </SidebarMenuButton>
            ) : (
                <Button
                    variant="outline"
                    size="icon"
                    data-testid="theme-button"
                    aria-label="Toggle theme"
                >
                    <Icon />
                </Button>
            )}
            <Dropdown.Popover placement={sidebar ? "top start" : "bottom end"}>
                <Dropdown.Menu
                    aria-label="Appearance"
                    selectionMode="single"
                    selectedKeys={[theme]}
                    onAction={(key) => setTheme(key as Theme)}
                >
                    <Dropdown.Item
                        id="light"
                        textValue="Light"
                        data-testid="light-mode"
                    >
                        <Sun />
                        <Label>Light</Label>
                        <Dropdown.ItemIndicator />
                    </Dropdown.Item>
                    <Dropdown.Item
                        id="dark"
                        textValue="Dark"
                        data-testid="dark-mode"
                    >
                        <Moon />
                        <Label>Dark</Label>
                        <Dropdown.ItemIndicator />
                    </Dropdown.Item>
                    <Dropdown.Item id="system" textValue="System">
                        <Display />
                        <Label>System</Label>
                        <Dropdown.ItemIndicator />
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
}
export function SidebarAppearance() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <ThemeMenu sidebar />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
export function Appearance() {
    return <ThemeMenu />;
}
