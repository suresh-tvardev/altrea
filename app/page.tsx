"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/home/LandingPage";
import { useRole } from "@/contexts/RoleContext";
import { isDemoAuthenticated } from "@/lib/demo-auth";

export default function Home() {
    const router = useRouter();
    const { role, loading } = useRole();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Wait for role to load
        if (loading) return;

        // Check if user is authenticated (demo mode)
        const authenticated = isDemoAuthenticated();

        if (!authenticated) {
            setIsChecking(false);
            return; // Show landing page
        }

        // If user is logged in, redirect to their dashboard
        if (role === 'elder') {
            router.replace("/elder");
            return;
        }

        if (role === 'caregiver') {
            router.replace("/caregiver");
            return;
        }

        // If authenticated but no role yet, wait a bit more
        // This handles the case where localStorage is set but role context hasn't updated
        const checkRole = setTimeout(() => {
            const demoRole = localStorage.getItem('altrea_demo_role');
            if (demoRole === 'elder') {
                router.replace("/elder");
            } else if (demoRole === 'caregiver') {
                router.replace("/caregiver");
            } else {
                setIsChecking(false);
            }
        }, 500);

        return () => clearTimeout(checkRole);
    }, [role, loading, router]);

    // Show loading while checking
    if (isChecking && loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    // Show landing page if not authenticated
    return <LandingPage />;
}
