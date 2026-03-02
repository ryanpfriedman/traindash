import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "TrainDash.io — Enterprise Course Creator",
  description: "Build, deploy, and track AI-powered training courses for your entire organization.",
  keywords: "enterprise training, course creator, AI learning, employee training, LMS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-auto">
            {children}
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1b2e",
              color: "#f1f5f9",
              border: "1px solid #2a2b40",
              borderRadius: "10px",
              fontSize: "0.875rem",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
