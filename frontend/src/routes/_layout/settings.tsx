import { Tabs } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import ChangePassword from "@/components/user-settings/change-password";
import DeleteAccount from "@/components/user-settings/delete-account";
import UserInformation from "@/components/user-settings/user-information";
import { APP_NAME } from "@/config";
import useAuth from "@/hooks/use-auth";

const tabsConfig = [
    { value: "my-profile", title: "My profile", component: UserInformation },
    { value: "password", title: "Password", component: ChangePassword },
    { value: "danger-zone", title: "Danger zone", component: DeleteAccount },
];

export const Route = createFileRoute("/_layout/settings")({
    component: UserSettings,
    head: () => ({
        meta: [
            {
                title: `Settings - ${APP_NAME}`,
            },
        ],
    }),
});

function UserSettings() {
    const { user: currentUser } = useAuth();
    const finalTabs = currentUser?.is_superuser
        ? tabsConfig.slice(0, 3)
        : tabsConfig;

    if (!currentUser) {
        return null;
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">
                    User Settings
                </h1>
                <p className="text-muted">
                    Manage your account settings and preferences
                </p>
            </div>

            <Tabs defaultSelectedKey="my-profile">
                <Tabs.ListContainer>
                    <Tabs.List aria-label="Account settings">
                        {finalTabs.map((tab) => (
                            <Tabs.Tab key={tab.value} id={tab.value}>
                                {tab.title}
                                <Tabs.Indicator />
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Tabs.ListContainer>
                {finalTabs.map((tab) => (
                    <Tabs.Panel key={tab.value} id={tab.value} className="pt-6">
                        <tab.component />
                    </Tabs.Panel>
                ))}
            </Tabs>
        </div>
    );
}
