import { Display, Moon, Sun } from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import { type Theme, useTheme } from "@/components/theme-provider";

const icons = { system: Display, light: Sun, dark: Moon };
export function Appearance({
    sidebar = false,
    collapsed = false,
}: {
    sidebar?: boolean;
    collapsed?: boolean;
}) {
    const { setTheme, theme } = useTheme();
    const Icon = icons[theme];
    return (
        <Dropdown>
            <Button
                variant={sidebar ? "ghost" : "outline"}
                isIconOnly={!sidebar || collapsed}
                className={
                    sidebar
                        ? collapsed
                            ? "w-full"
                            : "w-full justify-start gap-3"
                        : undefined
                }
                data-testid="theme-button"
                aria-label="Toggle theme"
            >
                <Icon />
                {sidebar && !collapsed && <span>Appearance</span>}
            </Button>
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
