"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    HeartHandshake, 
    Brain, 
    Shield, 
    Users, 
    Activity, 
    Bell,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Real-Time Emotional Wellness
                        <br />
                        for Your Loved Ones
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                        Altrea uses advanced EEG technology to monitor emotional states in real-time, 
                        providing peace of mind for caregivers and support for elders.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup">
                            <Button size="lg" className="text-lg px-8">
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button size="lg" variant="outline" className="text-lg px-8">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/demo">
                            <Button size="lg" variant="secondary" className="text-lg px-8">
                                View Demo
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="border-2 hover:border-primary transition-colors">
                            <CardContent className="pt-6">
                                <Brain className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Real-Time EEG Monitoring</h3>
                                <p className="text-muted-foreground">
                                    Continuous monitoring of brain activity to detect emotional states and stress levels.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary transition-colors">
                            <CardContent className="pt-6">
                                <Bell className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Instant Alerts</h3>
                                <p className="text-muted-foreground">
                                    Get notified immediately when your loved one experiences high stress or anxiety.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary transition-colors">
                            <CardContent className="pt-6">
                                <HeartHandshake className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Caregiver Connection</h3>
                                <p className="text-muted-foreground">
                                    Stay connected with family members and caregivers through a shared dashboard.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary transition-colors">
                            <CardContent className="pt-6">
                                <Activity className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Personalized Interventions</h3>
                                <p className="text-muted-foreground">
                                    Receive tailored recommendations for breathing exercises, music, and activities.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary transition-colors">
                            <CardContent className="pt-6">
                                <Shield className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Privacy & Security</h3>
                                <p className="text-muted-foreground">
                                    Your data is secure and private, with full control over who can access information.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 hover:border-primary transition-colors">
                            <CardContent className="pt-6">
                                <Users className="w-12 h-12 text-primary mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Circle of Care</h3>
                                <p className="text-muted-foreground">
                                    Build a network of trusted caregivers, doctors, and emergency contacts.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">1</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Set Up Your Account</h3>
                            <p className="text-muted-foreground">
                                Create an account and choose your role as an elder or caregiver. Connect your Altrea EEG device.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">2</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Monitor in Real-Time</h3>
                            <p className="text-muted-foreground">
                                The device continuously monitors emotional states and brain activity, providing insights and alerts.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-primary">3</span>
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Stay Connected</h3>
                            <p className="text-muted-foreground">
                                Caregivers receive alerts and can provide support, while elders get personalized interventions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-12">Why Choose Altrea?</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Peace of Mind for Families</h3>
                                <p className="text-muted-foreground">
                                    Know that your loved one is safe and well, even when you can't be there in person.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Early Intervention</h3>
                                <p className="text-muted-foreground">
                                    Detect stress and anxiety early, allowing for timely support and intervention.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Easy to Use</h3>
                                <p className="text-muted-foreground">
                                    Simple, intuitive interface designed for both elders and caregivers.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Comprehensive Support</h3>
                                <p className="text-muted-foreground">
                                    Access to breathing exercises, music therapy, and personalized activity recommendations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-blue-600 text-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Join Altrea today and experience the future of emotional wellness monitoring.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/auth/signup">
                            <Button size="lg" variant="secondary" className="text-lg px-8">
                                Create Free Account
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
