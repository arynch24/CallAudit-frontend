import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthenticationContext";
import { ContextProvider } from "@/context/DashboardContext";

export const metadata: Metadata = {
  title: "IntelliResume - Your AI Resume Builder",
  description: "Create professional resumes effortlessly with AI assistance. Tailor your resume to stand out in the job market.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ContextProvider>
            {children}
          </ContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
