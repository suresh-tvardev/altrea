"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserRound, HeartHandshake, ArrowRight, Loader2, Sparkles, Wifi, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { completeSetup, completeSetupWithPartner, checkSetupStatus, type PartnerDetails } from "@/app/actions/setup";

export default function SetupPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [role, setRole] = useState<"elder" | "caregiver" | null>(null);
    const [accountName, setAccountName] = useState("");
    const [deviceId, setDeviceId] = useState("");
    
    // Partner details state
    const [partnerName, setPartnerName] = useState("");
    const [partnerEmail, setPartnerEmail] = useState("");
    const [partnerPassword, setPartnerPassword] = useState("");
    const [partnerConfirmPassword, setPartnerConfirmPassword] = useState("");
    const [partnerPhone, setPartnerPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [checkingSetup, setCheckingSetup] = useState(true);
    const router = useRouter();

    // Check if setup is already complete on mount
    useEffect(() => {
        const checkExistingSetup = async () => {
            try {
                const status = await checkSetupStatus();
                if (status.isSetupComplete && status.role) {
                    // User already has account, redirect to their dashboard
                    if (status.role === 'elder') {
                        router.push('/elder');
                    } else if (status.role === 'caregiver') {
                        router.push('/caregiver');
                    }
                    return;
                }
                // If account exists but no role, or partial setup, pre-fill the form
                if (status.account) {
                    setAccountName(status.account.name || "");
                    setDeviceId(status.account.deviceId || "");
                }
                if (status.role) {
                    setRole(status.role);
                    setStep(2); // Skip to step 2 (partner details) if role is already set
                }
            } catch (error) {
                console.error('Error checking setup status:', error);
            } finally {
                setCheckingSetup(false);
            }
        };

        checkExistingSetup();
    }, [router]);

    const handleRoleSelect = (selectedRole: "elder" | "caregiver") => {
        setRole(selectedRole);
    };

    const handleNext = () => {
        if (role && step === 1) {
            setStep(2); // Go to account details
        } else if (step === 2) {
            // Validate account details before proceeding
            if (accountName && deviceId) {
                setStep(3); // Go to partner details
            } else {
                toast.error("Please fill in all account details");
            }
        }
    };

    const handleBack = () => {
        if (step === 3) {
            setStep(2); // Go back to account details
        } else if (step === 2) {
            setStep(1); // Go back to role selection
        }
    };

    const validatePartnerDetails = (): boolean => {
        if (!partnerName.trim()) {
            toast.error("Partner name is required");
            return false;
        }
        if (!partnerEmail.trim()) {
            toast.error("Partner email is required");
            return false;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(partnerEmail)) {
            toast.error("Please enter a valid email address");
            return false;
        }
        if (!partnerPassword) {
            toast.error("Partner password is required");
            return false;
        }
        if (partnerPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return false;
        }
        if (partnerPassword !== partnerConfirmPassword) {
            toast.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleCompleteSetup = async () => {
        if (!role || !accountName || !deviceId) return;
        setLoading(true);

        try {
            // Use the new function that creates partner account
            const partnerDetails: PartnerDetails = {
                name: partnerName,
                email: partnerEmail,
                password: partnerPassword,
                phone: partnerPhone || undefined,
                relationship: role === 'caregiver' ? 'Elder' : 'Caregiver'
            };

            const result = await completeSetupWithPartner(role, accountName, deviceId, partnerDetails);

            if (result.error) throw new Error(result.error);

            toast.success(`Success! Connected to ${accountName}. Partner account created for ${partnerEmail}.`);

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

    // Show loading state while checking setup status
    if (checkingSetup) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-white to-blue-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your account...</p>
            </div>
        );
    }

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
                        {step === 1 && "Tell us how you'll be using the platform."}
                        {step === 2 && "Connect your device and create your family circle."}
                        {step === 3 && (role === 'caregiver' ? "Enter details for the elder you're monitoring." : "Enter details for your caregiver or family member.")}
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
                                className="h-12 px-8"
                                onClick={handleNext}
                                disabled={!accountName || !deviceId}
                            >
                                Next Step
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="max-w-lg mx-auto border-none shadow-xl">
                        <CardHeader>
                            <CardTitle>
                                {role === 'caregiver' ? 'Elder / Patient Details' : 'Caregiver / Family Details'}
                            </CardTitle>
                            <CardDescription>
                                {role === 'caregiver' 
                                    ? "Create a login account for the elder you're monitoring."
                                    : "Create a login account for your caregiver or family member."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="partnerName">Full Name *</Label>
                                <Input
                                    id="partnerName"
                                    placeholder={role === 'caregiver' ? "Elder's full name" : "Caregiver's full name"}
                                    value={partnerName}
                                    onChange={(e) => setPartnerName(e.target.value)}
                                    className="h-12"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnerEmail">Email (Username) *</Label>
                                <Input
                                    id="partnerEmail"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={partnerEmail}
                                    onChange={(e) => setPartnerEmail(e.target.value)}
                                    className="h-12"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    This will be used to log in to their account.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnerPassword">Password *</Label>
                                <div className="relative">
                                    <Input
                                        id="partnerPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Minimum 6 characters"
                                        value={partnerPassword}
                                        onChange={(e) => setPartnerPassword(e.target.value)}
                                        className="h-12 pr-10"
                                        required
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-12 w-10"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Minimum 6 characters required.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnerConfirmPassword">Confirm Password *</Label>
                                <Input
                                    id="partnerConfirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={partnerConfirmPassword}
                                    onChange={(e) => setPartnerConfirmPassword(e.target.value)}
                                    className="h-12"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="partnerPhone">Phone Number (Optional)</Label>
                                <Input
                                    id="partnerPhone"
                                    type="tel"
                                    placeholder="+1 (555) 123-4567"
                                    value={partnerPhone}
                                    onChange={(e) => setPartnerPhone(e.target.value)}
                                    className="h-12"
                                />
                                <p className="text-xs text-muted-foreground">
                                    For emergency contacts and notifications.
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
                                disabled={!partnerName || !partnerEmail || !partnerPassword || !partnerConfirmPassword || loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Setting up...
                                    </>
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
