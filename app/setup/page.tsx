"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserRound, HeartHandshake, ArrowRight, Loader2, Sparkles, Wifi } from "lucide-react";
import { toast } from "sonner";
import { completeSetup } from "@/app/actions/setup";

export default function SetupPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [role, setRole] = useState<"elder" | "caregiver" | null>(null);
    const [accountName, setAccountName] = useState("");
    const [deviceId, setDeviceId] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRoleSelect = (selectedRole: "elder" | "caregiver") => {
        setRole(selectedRole);
    };

    const handleNext = () => {
        if (role) setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleCompleteSetup = async () => {
        if (!role || !accountName || !deviceId) return;
        setLoading(true);

        try {
            const result = await completeSetup(role, accountName, deviceId);

            if (result.error) throw new Error(result.error);

            toast.success(`Success! Connected to ${accountName}.`);

            // Redirect based on role
            if (role === 'elder') {
                router.push('/elder');
            } else {
                router.push('/caregiver');
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to setup account");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-white to-blue-50">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">Onboarding</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 italic">Configure Your Altrea Experience</h1>
                    <p className="text-muted-foreground text-lg">
                        {step === 1 ? "Tell us how you'll be using the platform." : "Connect your device and create your family circle."}
                    </p>
                </div>

                {step === 1 && (
                    <>
                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            {/* Elder Role Card */}
                            <Card
                                className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden group ${role === "elder" ? "border-primary ring-4 ring-primary/10 scale-[1.02]" : "hover:border-primary/50"
                                    }`}
                                onClick={() => handleRoleSelect("elder")}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 transition-colors ${role === "elder" ? "bg-primary text-white" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                                        }`}>
                                        <UserRound size={40} />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">I am an Elder</CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        I want to monitor my emotional state.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 pt-4 border-t">
                                        {["Simple interface", "Direct mood entries", "Personal wellness tips"].map((item, i) => (
                                            <li key={i} className="flex items-center text-sm text-muted-foreground italic">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Caregiver Role Card */}
                            <Card
                                className={`cursor-pointer transition-all duration-300 border-2 overflow-hidden group ${role === "caregiver" ? "border-primary ring-4 ring-primary/10 scale-[1.02]" : "hover:border-primary/50"
                                    }`}
                                onClick={() => handleRoleSelect("caregiver")}
                            >
                                <CardHeader className="text-center pb-2">
                                    <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 transition-colors ${role === "caregiver" ? "bg-primary text-white" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                                        }`}>
                                        <HeartHandshake size={40} />
                                    </div>
                                    <CardTitle className="text-2xl font-bold">I am a Caregiver</CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        I am caring for a loved one.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 pt-4 border-t">
                                        {["Detailed health dashboard", "Real-time EEG alerts", "Smart intervention guides"].map((item, i) => (
                                            <li key={i} className="flex items-center text-sm text-muted-foreground italic">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                className="h-14 px-12 text-lg rounded-full group"
                                disabled={!role}
                                onClick={handleNext}
                            >
                                Next Step
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <Card className="max-w-lg mx-auto border-none shadow-xl">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>
                                Create a shared space for you and your family.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="accountName">Family / Account Name</Label>
                                <Input
                                    id="accountName"
                                    placeholder="e.g. Smith Family Care"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    className="h-12"
                                />
                                <p className="text-xs text-muted-foreground">
                                    This will be the name of your shared dashboard.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deviceId">Device Connection ID</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="deviceId"
                                            placeholder="e.g. SN-8923-WiFi"
                                            value={deviceId}
                                            onChange={(e) => setDeviceId(e.target.value)}
                                            className="h-12 pl-10"
                                        />
                                        <Wifi className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Found on the back of your Altrea EEG headset.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4">
                            <Button variant="outline" onClick={handleBack} className="h-12 px-6">
                                Back
                            </Button>
                            <Button
                                className="flex-1 h-12"
                                onClick={handleCompleteSetup}
                                disabled={!accountName || !deviceId || loading}
                            >
                                {loading ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    "Complete Setup"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    );
}
