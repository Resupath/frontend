import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--primary)",
                "on-primary": "var(--on-primary)",
                secondary: "var(--secondary)",
                "on-secondary": "var(--on-secondary)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                text: "var(--text)",
                "card-bg": "var(--card-bg)",
                "card-fg": "var(--card-fg)",
                surface: "var(--surface)",
            },
        },
    },
    plugins: [],
} satisfies Config;
