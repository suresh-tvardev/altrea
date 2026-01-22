import { redirect } from "next/navigation";
import { fetchUserRole } from "@/app/actions/user";

export default async function Home() {
    const role = await fetchUserRole();

    if (!role) {
        redirect("/setup");
    }

    if (role === 'elder') {
        redirect("/elder");
    }

    if (role === 'caregiver') {
        redirect("/caregiver");
    }

    // Fallback?
    redirect("/setup");
}
