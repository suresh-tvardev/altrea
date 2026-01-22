"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");
    const isLandingPage = pathname === "/";
    const [isOpen, setIsOpen] = useState(false);

    if (!isLandingPage && !isAuthPage) return null;

    return (
        <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                Altrea
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                            How it Works
                        </Link>
                        <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                            About
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/auth/login">
                            <Button variant="ghost">Sign In</Button>
                        </Link>
                        <Link href="/auth/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <div className="flex flex-col space-y-6 mt-8">
                                    <Link
                                        href="#features"
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#how-it-works"
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        How it Works
                                    </Link>
                                    <Link
                                        href="#about"
                                        className="text-lg font-medium hover:text-primary transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        About
                                    </Link>
                                    <div className="flex flex-col space-y-4 pt-4 border-t">
                                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-start">Sign In</Button>
                                        </Link>
                                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full">Get Started</Button>
                                        </Link>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}
