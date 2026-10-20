import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Be-Electric | Network Operations",
  description: "Be-Electric charging network administration dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
