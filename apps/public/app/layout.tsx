import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AppThemeProvider } from "@reading/ui";
import { NavBar } from "./components/NavBar";
import { SessionProvider } from "./components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reading — Book Club",
  description: "Book club app for English language learners"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AppRouterCacheProvider>
            <AppThemeProvider>
              <NavBar />
              {children}
            </AppThemeProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
