import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const ErrorComponent = () => {
    return (
        <div
            className="flex min-h-screen flex-col items-center justify-center p-4"
            data-testid="error-component"
        >
            <div className="z-10 flex items-center">
                <div className="ml-4 flex flex-col items-center justify-center p-4">
                    <span className="mb-4 font-bold text-6xl leading-none md:text-8xl">
                        Error
                    </span>
                    <span className="mb-2 font-bold text-2xl">Oops!</span>
                </div>
            </div>

            <p className="z-10 mb-4 text-center text-lg text-muted-foreground">
                Something went wrong. Please try again.
            </p>
            <Link to="/">
                <Button>Go Home</Button>
            </Link>
        </div>
    );
};

export default ErrorComponent;
