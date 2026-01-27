import { redirect } from "next/navigation";
import { fetchUserRole, isAuthenticatedButMissingProfile } from "@/app/actions/user";
import { LandingPage } from "@/components/home/LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
    // Check if user is authenticated but missing profile
    const needsSetup = await isAuthenticatedButMissingProfile();
    if (needsSetup) {
        redirect("/setup");
    }

    // fetchUserRole already handles errors and returns null on failure
    const role = await fetchUserRole();

    // If user is not logged in, show landing page
    if (!role) {
        return <LandingPage />;
    }

    // If user is logged in, redirect to their dashboard
    // Note: redirect() throws NEXT_REDIRECT internally - this is expected behavior
    if (role === 'elder') {
        redirect("/elder");
    }

    if (role === 'caregiver') {
        redirect("/caregiver");
    }

    // Fallback - should not reach here, but redirect to setup if role is invalid
    redirect("/setup");
}
