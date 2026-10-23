import { Eye, EyeSlash } from "@gravity-ui/icons";
import { cn, Input, Tooltip } from "@heroui/react";
import { type ComponentProps, useState } from "react";
import { Button } from "./button";

export function PasswordInput({
    className,
    ...props
}: ComponentProps<typeof Input>) {
    const [visible, setVisible] = useState(false);
    const label = visible ? "Hide password" : "Show password";
    return (
        <div className="relative">
            <Input
                {...props}
                type={visible ? "text" : "password"}
                className={cn("w-full pr-12", className)}
            />
            <Tooltip>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    onPress={() => setVisible(!visible)}
                    aria-label={label}
                >
                    {visible ? <EyeSlash /> : <Eye />}
                </Button>
                <Tooltip.Content>{label}</Tooltip.Content>
            </Tooltip>
        </div>
    );
}
