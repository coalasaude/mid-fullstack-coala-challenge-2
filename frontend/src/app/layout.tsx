import "./globals.css";
import { ThemeRegistry } from "@/theme/ThemeRegistry";

export const metadata = {
  title: "HealthFlow",
  description: "HealthFlow MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
