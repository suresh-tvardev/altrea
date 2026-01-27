"use client";

import { useState } from 'react';
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
    LogIn
} from 'lucide-react';
import { setupDemoEnvironment } from '@/app/actions/demo';
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
            email: 'demo.elder@altrea.test',
            password: 'Demo123!',
            name: 'Margaret Smith',
        },
        caregiver: {
            email: 'demo.caregiver@altrea.test',
            password: 'Demo123!',
            name: 'John Smith',
        },
        description: 'Complete demo account with elder, caregiver, and care team members',
    },
    {
        name: 'Johnson Wellness Circle',
        elder: {
            email: 'demo.elder2@altrea.test',
            password: 'Demo123!',
            name: 'Robert Johnson',
        },
        caregiver: {
            email: 'demo.caregiver2@altrea.test',
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
    const router = useRouter();

    const handleSetupDemo = async () => {
        setIsSettingUp(true);
        try {
            const result = await setupDemoEnvironment();
            setSetupResults(result.results || []);
            setSetupComplete(result.success);
            
            if (result.success) {
                toast.success('Demo environment setup complete!');
            } else {
                toast.error('Some demo accounts failed to create. Check results below.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to setup demo environment');
        } finally {
            setIsSettingUp(false);
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
            router.refresh();
            
            // Redirect based on role
            setTimeout(() => {
                if (role === 'elder') {
                    router.push('/elder');
                } else {
                    router.push('/caregiver');
                }
            }, 500);
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
                        Perfect for stakeholder validation and testing.
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
                        <Button
                            onClick={handleSetupDemo}
                            disabled={isSettingUp || setupComplete}
                            size="lg"
                            className="w-full md:w-auto"
                        >
                            {isSettingUp ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Setting up demo environment...
                                </>
                            ) : setupComplete ? (
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

                {/* Testing Scenarios */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-2xl">Testing Scenarios</CardTitle>
                        <CardDescription>
                            Recommended testing workflows for stakeholders
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Stress Event Simulation</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Login as elder, navigate to <Link href="/simulator" className="text-primary underline">Simulator</Link> page, 
                                        trigger stress events, then login as caregiver to see alerts appear in real-time.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Circle of Care</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Login as elder, view the Circle of Care panel to see all caregivers and contacts. 
                                        Test the emergency call functionality.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Caregiver Dashboard</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Login as caregiver, explore the comprehensive dashboard with EEG waveforms, 
                                        alerts, historical charts, and intervention recommendations.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                                    4
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-1">Alert System</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Use the simulator to trigger critical stress events and verify that alerts 
                                        are generated and displayed to caregivers. Check alert history and acknowledgment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/simulator">
                        <Button variant="outline" size="lg">
                            <Zap className="w-5 h-5 mr-2" />
                            Stress Simulator
                        </Button>
                    </Link>
                    <Link href="/settings">
                        <Button variant="outline" size="lg">
                            <Activity className="w-5 h-5 mr-2" />
                            Settings
                        </Button>
                    </Link>
                    <Link href="/alerts">
                        <Button variant="outline" size="lg">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Alert History
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

