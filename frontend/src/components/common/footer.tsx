export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t px-6 py-4">
            <p className="text-center text-muted-foreground text-sm">
                Handwriting Recognition - {currentYear}
            </p>
        </footer>
    );
}
