import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-white">
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                <ChevronLeft className="mr-1 w-4 h-4" />
                Back to Home
            </Link>
            <Suspense fallback={<div className="w-full max-w-md h-96 animate-pulse rounded-lg bg-muted" />}>
                <AuthForm type="signup" />
            </Suspense>
        </div>
    );
}
