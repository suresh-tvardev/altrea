"use client";

import { Suspense, useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";
import { ChevronLeft, UserRound, HeartHandshake } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
    const [selectedRole, setSelectedRole] = useState<"elder" | "caregiver">("elder");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-gray-50 to-white">
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
                <ChevronLeft className="mr-1 w-4 h-4" />
                Back to Home
            </Link>
            <div className="w-full max-w-md space-y-4">
                <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as "elder" | "caregiver")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="elder" className="flex items-center gap-2">
                            <UserRound className="w-4 h-4" />
                            Elder
                        </TabsTrigger>
                        <TabsTrigger value="caregiver" className="flex items-center gap-2">
                            <HeartHandshake className="w-4 h-4" />
                            Caregiver
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
                <Suspense fallback={<div className="w-full h-96 animate-pulse rounded-lg bg-muted" />}>
                    <AuthForm type="login" roleIntent={selectedRole} />
            </Suspense>
            </div>
        </div>
    );
}
