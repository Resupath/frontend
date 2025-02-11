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
    title: "Resupath",
    description: "Resupath",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const theme = (cookieStore.get("theme")?.value as "dark" | "light") || "dark";

    return (
        <html lang="ko" className={theme}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeStoreProvider initialTheme={theme}>
                    <Home>{children}</Home>
                </ThemeStoreProvider>
            </body>
        </html>
    );
}
