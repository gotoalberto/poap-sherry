import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "POAP Minter - Twitter Mini App",
  description: "Claim your commemorative POAP on Twitter with Sherry",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "POAP Minter - Twitter Mini App",
    description: "Claim your commemorative POAP on Twitter with Sherry",
    images: ["/poap-event-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "POAP Minter - Twitter Mini App",
    description: "Claim your commemorative POAP on Twitter with Sherry",
    images: ["/poap-event-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}