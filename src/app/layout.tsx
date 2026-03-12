import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Padel Elite - Management Suite",
    description: "Sistema de gestión integral para clubes de padel de alto rendimiento.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className="antialiased dark">
                {children}
            </body>
        </html>
    );
}
