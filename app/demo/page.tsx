"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Users, 
    HeartHandshake, 
    UserRound, 
    Activity, 
    AlertTriangle, 
    Phone, 
    Brain, 
    Zap,
    CheckCircle2,
    Loader2,
    ArrowRight,
    PlayCircle,
    LogIn,
    Trash2
} from 'lucide-react';
import { setupDemoEnvironment, clearDemoEnvironment, checkDemoUsersExist } from '@/app/actions/demo';
import { login } from '@/app/actions/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const USE_CASES = [
    {
        title: 'Real-time Stress Monitoring',
        description: 'Monitor elder emotional state in real-time through EEG data analysis',
        icon: Activity,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
    },
    {
        title: 'Automated Alert System',
        description: 'Caregivers receive instant alerts when stress levels exceed thresholds',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
    },
    {
        title: 'Circle of Care',
        description: 'Elder can easily contact caregivers, family members, and doctors',
        icon: Users,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
    },
    {
        title: 'Smart Interventions',
        description: 'AI-powered recommendations for stress management and emotional support',
        icon: Brain,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
    },
    {
        title: 'Historical Analytics',
        description: 'Track emotional patterns over time to identify trends and improvements',
        icon: Activity,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
    },
    {
        title: 'Dual Dashboard Views',
        description: 'Separate interfaces for elders (simple) and caregivers (detailed)',
        icon: UserRound,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
    },
];

const DEMO_ACCOUNTS = [
    {
        name: 'Smith Family Care',
        elder: {
            email: 'margaret.smith@altrea.com',
            password: 'Demo123!',
            name: 'Margaret Smith',
        },
        caregiver: {
            email: 'john.smith@altrea.com',
            password: 'Demo123!',
            name: 'John Smith',
        },
        description: 'Complete demo account with elder, caregiver, and care team members',
    },
    {
        name: 'Johnson Wellness Circle',
        elder: {
            email: 'robert.johnson@altrea.com',
            password: 'Demo123!',
            name: 'Robert Johnson',
        },
        caregiver: {
            email: 'lisa.johnson@altrea.com',
            password: 'Demo123!',
            name: 'Lisa Johnson',
        },
        description: 'Secondary demo account for testing multiple scenarios',
    },
];

export default function DemoPage() {
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [setupComplete, setSetupComplete] = useState(false);
    const [setupResults, setSetupResults] = useState<any[]>([]);
    const [isClearing, setIsClearing] = useState(false);
    const [checkingDemo, setCheckingDemo] = useState(true);
    const [demoUsersExist, setDemoUsersExist] = useState(false);
    const router = useRouter();

    // Check if demo users exist on mount
    useEffect(() => {
        const checkDemo = async () => {
            try {
                const result = await checkDemoUsersExist();
                setDemoUsersExist(result.exists || false);
                setSetupComplete(result.exists || false);
            } catch (error) {
                console.error('Error checking demo users:', error);
            } finally {
                setCheckingDemo(false);
            }
        };
        checkDemo();
    }, []);

    const handleSetupDemo = async () => {
        setIsSettingUp(true);
        try {
            const result = await setupDemoEnvironment();
            setSetupResults(result.results || []);
            setSetupComplete(result.success);
            
            if (result.success) {
                toast.success('Demo environment setup complete!');
                setDemoUsersExist(true);
            } else {
                toast.error('Some demo accounts failed to create. Check results below.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to setup demo environment');
        } finally {
            setIsSettingUp(false);
        }
    };

    const handleClearDemo = async () => {
        if (!confirm('Are you sure you want to delete all demo accounts and users? This action cannot be undone.')) {
            return;
        }

        setIsClearing(true);
        try {
            const result = await clearDemoEnvironment();
            
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Demo environment cleared! Deleted ${result.deletedAccounts} accounts and ${result.deletedUsers} users.`);
                setSetupComplete(false);
                setSetupResults([]);
                setDemoUsersExist(false);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to clear demo environment');
        } finally {
            setIsClearing(false);
        }
    };

    const handleQuickLogin = async (email: string, password: string, role: 'elder' | 'caregiver') => {
        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            
            const result = await login(formData);
            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.success(`Logged in as ${role}`);
            
            // Redirect based on role
            if (role === 'elder') {
                window.location.href = '/elder';
            } else {
                window.location.href = '/caregiver';
            }
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                        <PlayCircle className="w-5 h-5 mr-2" />
                        <span className="font-semibold">Demo & Validation Environment</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Altrea Platform Demo
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Experience the complete Altrea platform with pre-configured demo accounts.
                        
                    </p>
                </div>

                {/* Setup Section */}
                <Card className="border-2 border-primary/20 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Zap className="w-6 h-6 text-primary" />
                            Quick Setup
                        </CardTitle>
                        <CardDescription>
                            Create demo accounts with sample users, care teams, and data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {checkingDemo ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                <span className="text-muted-foreground">Checking demo environment...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={handleSetupDemo}
                                    disabled={isSettingUp || demoUsersExist || isClearing}
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    {isSettingUp ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Setting up demo environment...
                                        </>
                                    ) : demoUsersExist ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Demo Environment Ready
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle className="w-5 h-5 mr-2" />
                                            Setup Demo Environment
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={handleClearDemo}
                                    disabled={!demoUsersExist || isSettingUp || isClearing}
                                    size="lg"
                                    variant="destructive"
                                    className="w-full sm:w-auto"
                                >
                                    {isClearing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Clearing demo environment...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-5 h-5 mr-2" />
                                            Clear Demo Environment
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {setupComplete && setupResults.length > 0 && (
                            <div className="space-y-2 mt-4">
                                {setupResults.map((result, idx) => (
                                    <Alert
                                        key={idx}
                                        className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}
                                    >
                                        <AlertDescription>
                                            <strong>{result.accountName}:</strong>{' '}
                                            {result.success ? '✓ Created successfully' : `✗ ${result.error || 'Failed'}`}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Demo Accounts */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-center">Demo Accounts</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {DEMO_ACCOUNTS.map((account, idx) => (
                            <Card key={idx} className="border-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-2xl">{account.name}</CardTitle>
                                        <Badge variant="outline">Demo Account</Badge>
                                    </div>
                                    <CardDescription>{account.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Elder Login */}
                                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserRound className="w-5 h-5 text-pink-600" />
                                            <span className="font-semibold">Elder User</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-3">
                                            <div><strong>Name:</strong> {account.elder.name}</div>
                                            <div><strong>Email:</strong> {account.elder.email}</div>
                                            <div><strong>Password:</strong> {account.elder.password}</div>
                                        </div>
                                        <Button
                                            onClick={() => handleQuickLogin(account.elder.email, account.elder.password, 'elder')}
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                        >
                                            <LogIn className="w-4 h-4 mr-2" />
                                            Login as Elder
                                        </Button>
                                    </div>

                                    {/* Caregiver Login */}
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <HeartHandshake className="w-5 h-5 text-blue-600" />
                                            <span className="font-semibold">Caregiver User</span>
                                        </div>
                                        <div className="text-sm text-muted-foreground mb-3">
                                            <div><strong>Name:</strong> {account.caregiver.name}</div>
                                            <div><strong>Email:</strong> {account.caregiver.email}</div>
                                            <div><strong>Password:</strong> {account.caregiver.password}</div>
                                        </div>
                                        <Button
                                            onClick={() => handleQuickLogin(account.caregiver.email, account.caregiver.password, 'caregiver')}
                                            variant="outline"
                                            className="w-full"
                                            size="sm"
                                        >
                                            <LogIn className="w-4 h-4 mr-2" />
                                            Login as Caregiver
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Step-by-Step Validation Guide */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-primary" />
                            Step-by-Step Validation Guide
                        </CardTitle>
                        <CardDescription>
                            Complete validation workflow for stakeholders to test all features
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Phase 1: Setup */}
                            <div className="border-l-4 border-primary pl-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-primary">Phase 1</Badge>
                                    <h3 className="text-xl font-bold">Initial Setup</h3>
                                </div>
                                <div className="space-y-3 ml-2">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium">Setup Demo Environment</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click the <strong>"Setup Demo Environment"</strong> button above to create demo accounts. 
                                                Wait for confirmation that accounts are created successfully.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium">Verify Account Creation</p>
                                            <p className="text-sm text-muted-foreground">
                                                Check the setup results below the button. You should see "✓ Created successfully" for both demo accounts.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phase 2: Elder Experience */}
                            <div className="border-l-4 border-pink-500 pl-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-pink-500">Phase 2</Badge>
                                    <h3 className="text-xl font-bold">Elder User Experience</h3>
                                </div>
                                <div className="space-y-3 ml-2">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 text-pink-700 flex items-center justify-center text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium">Login as Elder</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click <strong>"Login as Elder"</strong> for "Smith Family Care" account. 
                                                You should be redirected to the Elder Dashboard.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 text-pink-700 flex items-center justify-center text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium">Mood Selection</p>
                                            <p className="text-sm text-muted-foreground">
                                                Select your current mood (Good, Bad, Happy, Calm, Stressed, Lonely, or Sad). 
                                                This sets the baseline for the session.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 text-pink-700 flex items-center justify-center text-sm font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="font-medium">View Circle of Care</p>
                                            <div className="text-sm text-muted-foreground">
                                                <p>Scroll down to see the <strong>"Circle of Care"</strong> panel. Verify you can see:</p>
                                                <ul className="list-disc list-inside mt-1 ml-2">
                                                    <li>Primary Caregiver (John Smith)</li>
                                                    <li>Family members (Sarah Smith - Daughter)</li>
                                                    <li>Doctors (Dr. Emily Johnson)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 text-pink-700 flex items-center justify-center text-sm font-bold">
                                            4
                                        </div>
                                        <div>
                                            <p className="font-medium">Test Emergency Button</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click the <strong>"Emergency Services"</strong> button in Circle of Care. 
                                                Verify it initiates an emergency call (will show tel:911 link).
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-500/20 text-pink-700 flex items-center justify-center text-sm font-bold">
                                            5
                                        </div>
                                        <div>
                                            <p className="font-medium">Navigate to Simulator</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click <strong>"Simulator"</strong> in the header (or go to <Link href="/simulator" className="text-primary underline">/simulator</Link>). 
                                                This is where you'll trigger stress events.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phase 3: Stress Simulation */}
                            <div className="border-l-4 border-red-500 pl-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-red-500">Phase 3</Badge>
                                    <h3 className="text-xl font-bold">Stress Event Simulation</h3>
                                </div>
                                <div className="space-y-3 ml-2">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-700 flex items-center justify-center text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium">Trigger Mild Stress</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click the <strong>"Mild Stress"</strong> preset button. 
                                                Observe the stress level indicator update in real-time.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-700 flex items-center justify-center text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium">Trigger Warning-Level Stress</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click <strong>"High Stress"</strong> (75%). Verify the emotional state changes to "Stressed" or "Anxious". 
                                                Check the Active Alerts panel - a warning alert should appear.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-700 flex items-center justify-center text-sm font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="font-medium">Trigger Critical Stress</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click <strong>"Critical Stress"</strong> (90%). Verify:
                                                <ul className="list-disc list-inside mt-1 ml-2">
                                                    <li>Emotional state shows "Stressed" or "Fear"</li>
                                                    <li>Stress level exceeds 80%</li>
                                                    <li>A <strong>CRITICAL</strong> alert appears in the Active Alerts panel</li>
                                                    <li>Alert shows it was sent to caregivers</li>
                                                </ul>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-700 flex items-center justify-center text-sm font-bold">
                                            4
                                        </div>
                                        <div>
                                            <p className="font-medium">Test Auto-Play</p>
                                            <p className="text-sm text-muted-foreground">
                                                Set stress level to 85% using the slider, then click <strong>"Auto-Play"</strong>. 
                                                Verify stress events trigger every 2 seconds. Click <strong>"Stop"</strong> to end.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phase 4: Caregiver Experience */}
                            <div className="border-l-4 border-blue-500 pl-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-blue-500">Phase 4</Badge>
                                    <h3 className="text-xl font-bold">Caregiver Dashboard & Alerts</h3>
                                </div>
                                <div className="space-y-3 ml-2">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-700 flex items-center justify-center text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium">Login as Caregiver</p>
                                            <p className="text-sm text-muted-foreground">
                                                Open a <strong>new browser tab/window</strong> (or use incognito mode). 
                                                Navigate back to this demo page and click <strong>"Login as Caregiver"</strong> 
                                                for "Smith Family Care". You should see the Caregiver Dashboard.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-700 flex items-center justify-center text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium">Verify Alerts Panel</p>
                                            <p className="text-sm text-muted-foreground">
                                                Check the <strong>Alerts Panel</strong> on the right side. You should see:
                                                <ul className="list-disc list-inside mt-1 ml-2">
                                                    <li>The critical alert triggered from the elder's simulator</li>
                                                    <li>Alert type, message, and timestamp</li>
                                                    <li>Option to acknowledge the alert</li>
                                                </ul>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-700 flex items-center justify-center text-sm font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="font-medium">Explore Dashboard Components</p>
                                            <p className="text-sm text-muted-foreground">
                                                Verify all dashboard sections are visible:
                                                <ul className="list-disc list-inside mt-1 ml-2">
                                                    <li><strong>Quick Stats:</strong> Shows emotional state summary</li>
                                                    <li><strong>Emotional State Indicator:</strong> Current state visualization</li>
                                                    <li><strong>EEG Waveform:</strong> Real-time brain activity graph</li>
                                                    <li><strong>Historical Chart:</strong> Trends over time</li>
                                                    <li><strong>Insights Panel:</strong> AI-generated recommendations</li>
                                                </ul>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-700 flex items-center justify-center text-sm font-bold">
                                            4
                                        </div>
                                        <div>
                                            <p className="font-medium">Test Real-Time Updates</p>
                                            <p className="text-sm text-muted-foreground">
                                                Go back to the elder's tab and trigger more stress events. 
                                                Switch back to caregiver tab and verify new alerts appear in real-time 
                                                without page refresh.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-700 flex items-center justify-center text-sm font-bold">
                                            5
                                        </div>
                                        <div>
                                            <p className="font-medium">View Alert History</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click <strong>"Alerts"</strong> in the header or navigate to <Link href="/alerts" className="text-primary underline">/alerts</Link>. 
                                                Verify you can see the full history of alerts with filters and timestamps.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phase 5: Additional Features */}
                            <div className="border-l-4 border-green-500 pl-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Badge className="bg-green-500">Phase 5</Badge>
                                    <h3 className="text-xl font-bold">Additional Features</h3>
                                </div>
                                <div className="space-y-3 ml-2">
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-700 flex items-center justify-center text-sm font-bold">
                                            1
                                        </div>
                                        <div>
                                            <p className="font-medium">Care Team Management</p>
                                            <p className="text-sm text-muted-foreground">
                                                As caregiver, go to <Link href="/settings" className="text-primary underline">Settings</Link>. 
                                                Verify you can:
                                                <ul className="list-disc list-inside mt-1 ml-2">
                                                    <li>View all care team members</li>
                                                    <li>Add new caregivers/family members</li>
                                                    <li>Set alert thresholds</li>
                                                    <li>Configure alert preferences</li>
                                                </ul>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-700 flex items-center justify-center text-sm font-bold">
                                            2
                                        </div>
                                        <div>
                                            <p className="font-medium">Intervention Recommendations</p>
                                            <p className="text-sm text-muted-foreground">
                                                When stress levels are high, verify that intervention dialogs appear 
                                                with recommendations for breathing exercises, music, or activities.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-700 flex items-center justify-center text-sm font-bold">
                                            3
                                        </div>
                                        <div>
                                            <p className="font-medium">Profile Management</p>
                                            <p className="text-sm text-muted-foreground">
                                                Click <strong>"Profile"</strong> in the header. Verify you can view and update 
                                                your profile information, including name, email, and role.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-700 flex items-center justify-center text-sm font-bold">
                                            4
                                        </div>
                                        <div>
                                            <p className="font-medium">Device Connection</p>
                                            <p className="text-sm text-muted-foreground">
                                                As caregiver, verify the <strong>"Device Connected"</strong> indicator in the header. 
                                                Toggle it to simulate device connection/disconnection. 
                                                Verify the dashboard switches between real-time data and simulated data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Checklist */}
                            <div className="mt-8 p-4 bg-white rounded-lg border-2 border-primary/20">
                                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                    Validation Checklist
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Demo accounts created successfully</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Elder dashboard accessible and functional</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Circle of Care shows all contacts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Stress simulator triggers events correctly</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Alerts appear in caregiver dashboard</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Real-time updates work without refresh</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Alert history is accessible</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Settings page allows care team management</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Interventions appear for high stress</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" className="w-4 h-4" />
                                        <span>Device connection toggle works</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-xl">Quick Access Links</CardTitle>
                        <CardDescription>
                            Important pages for testing and validation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/simulator" className="block">
                                <Button variant="default" size="lg" className="w-full">
                                    <Zap className="w-5 h-5 mr-2" />
                                    Stress Simulator
                                </Button>
                            </Link>
                            <Link href="/settings" className="block">
                                <Button variant="outline" size="lg" className="w-full">
                                    <Activity className="w-5 h-5 mr-2" />
                                    Settings
                                </Button>
                            </Link>
                            <Link href="/alerts" className="block">
                                <Button variant="outline" size="lg" className="w-full">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    Alert History
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Use Cases */}
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-center">Key Use Cases</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {USE_CASES.map((useCase, idx) => (
                            <Card key={idx} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-xl ${useCase.bgColor} flex items-center justify-center mb-4`}>
                                        <useCase.icon className={`w-6 h-6 ${useCase.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{useCase.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{useCase.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


