import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeStoreProvider } from "@/src/providers/themeStoreProvider";
import Home from "@/src/components/layout/home";
import "./globals.css";
import { cookies } from "next/headers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "면시",
    description: "면시",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const theme = (cookieStore.get("theme")?.value as "dark" | "light") || "light";

    return (
        <html lang="ko" className={theme}>
            <head>
                <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeStoreProvider initialTheme={theme}>
                    <Home>{children}</Home>
                </ThemeStoreProvider>
            </body>
        </html>
    );
}
