import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
    title: "Altrea - EEG Emotional Wellness Platform",
    description: "Real-time EEG monitoring platform for elderly emotional wellness. Track emotional states, receive personalized insights, and connect with caregivers.",
    authors: [{ name: "Altrea" }],
    openGraph: {
        title: "Altrea - EEG Emotional Wellness",
        description: "Real-time emotional monitoring and caregiver alerts for elderly care",
        type: "website",
        images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
    },
    twitter: {
        card: "summary_large_image",
        site: "@Altrea",
        images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
