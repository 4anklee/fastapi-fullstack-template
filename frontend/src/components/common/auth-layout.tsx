import { Appearance } from "@/components/common/appearance";
import { Logo } from "@/components/common/logo";
import { APP_DESCRIPTION } from "@/config";
import { Footer } from "./footer";

type AuthLayoutProps = {
    children: React.ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="bg-default relative hidden lg:flex lg:items-center lg:justify-center dark:bg-zinc-900">
                <div className="max-w-md space-y-4 px-8">
                    <Logo variant="full" className="text-2xl" asLink={false} />
                    <p className="text-muted">{APP_DESCRIPTION}</p>
                </div>
            </div>
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-end">
                    <Appearance />
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">{children}</div>
                </div>
                <Footer />
            </div>
        </div>
    );
}
