import { APP_NAME } from "@/config";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t px-6 py-4">
            <p className="text-muted text-center text-sm">
                {APP_NAME} - {currentYear}
            </p>
        </footer>
    );
}
