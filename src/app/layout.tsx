import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AppProviders } from "@/components/providers/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#080B0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://terra-recon.io"),
  title: "TerraRecon | Single-Pass Drone Video to 3D Terrain Reconstruction",
  description:
    "Turn single-pass aerial drone video footage into georeferenced, survey-grade 3D terrain meshes, dense point clouds, and digital elevation models without multi-pass crosshatch flight grids.",
  keywords: [
    "drone photogrammetry",
    "3D terrain reconstruction",
    "single-pass video",
    "structure from motion",
    "multi-view stereo",
    "point cloud",
    "digital elevation model",
    "geospatial engineering",
    "SIH 2026",
    "UAV mapping",
  ],
  authors: [{ name: "TerraRecon Engineering Group" }],
  creator: "TerraRecon",
  publisher: "TerraRecon",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://terra-recon.io",
    title: "TerraRecon | Single-Pass Drone Video to 3D Terrain Reconstruction",
    description:
      "Transform a single drone flight into an explorable 3D reconstruction. Centimeter-grade photogrammetry from continuous video corridors.",
    siteName: "TerraRecon",
    images: [
      {
        url: "/images/quarry.jpg",
        width: 1200,
        height: 630,
        alt: "TerraRecon 3D Terrain Photogrammetry Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TerraRecon | Single-Pass Drone Video to 3D Terrain Reconstruction",
    description:
      "Transform a single drone flight into an explorable 3D reconstruction with real-time telemetry and georeferenced 3D models.",
    images: ["/images/quarry.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} dark antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#080B0A] text-[#F1F4F2] selection:bg-[#78AFA2]/30 selection:text-[#F1F4F2] font-sans">
        <AppProviders>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
