"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, signup } from "@/app/actions/auth";
import { checkSetupStatus } from "@/app/actions/setup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";

interface AuthFormProps {
    type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const emailFromUrl = searchParams.get("email") ?? "";

    useEffect(() => {
        if (emailFromUrl && type === "login") {
            setEmail(decodeURIComponent(emailFromUrl));
        }
    }, [emailFromUrl, type]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { refetchRole } = useRole();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            if (type === "signup") {
                formData.append("origin", window.location.origin);
                const result = await signup(formData);

                if (result.error) throw new Error(result.error);
                toast.success("Account created successfully!");

                // Refetch role so Header/topbar shows icons immediately
                await refetchRole();
                router.refresh();

                // Redirect to setup after signup
                router.replace("/setup");
            } else {
                const result = await login(formData);

                if (result.error) throw new Error(result.error);
                toast.success("Logged in successfully!");

                // Refetch role so Header/topbar shows icons immediately (avoids missing icons until hard refresh)
                await refetchRole();
                router.refresh();

                // Check if setup is already complete
                const setupStatus = await checkSetupStatus();
                if (setupStatus.isSetupComplete && setupStatus.role) {
                    if (setupStatus.role === 'elder') {
                        router.replace('/elder');
                    } else if (setupStatus.role === 'caregiver') {
                        router.replace('/caregiver');
                    } else {
                        router.replace('/setup');
                    }
                } else {
                    router.replace("/setup");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md border-none shadow-2xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                        <BrainCircuit className="text-white w-8 h-8" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold">
                    {type === "login" ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription>
                    {type === "login"
                        ? "Enter your credentials to access your dashboard"
                        : "Join Altrea to start monitoring emotional wellbeing"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleAuth}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            {type === "login" && (
                                <Link href="#" className="text-xs text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12"
                        />
                    </div>
                    {type === "login" && emailFromUrl && (
                        <p className="text-xs text-muted-foreground">
                            Opened from Settings to view as this user. Demo accounts use password <strong>Demo123!</strong>
                        </p>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button className="w-full h-12 text-lg font-semibold" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {type === "login" ? "Sign In" : "Sign Up"}
                    </Button>
                    <div className="text-sm text-center text-muted-foreground italic">
                        {type === "login" ? (
                            <>
                                Don't have an account?{" "}
                                <Link href="/auth/signup" className="text-primary hover:underline font-semibold">
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <Link href="/auth/login" className="text-primary hover:underline font-semibold">
                                    Sign in
                                </Link>
                            </>
                        )}
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
