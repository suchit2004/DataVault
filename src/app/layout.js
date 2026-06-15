import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DataVault + SafeShare | Privacy Protection & Cryptographic Safety Ledger",
  description: "Securely scan your exposure across major data brokers, automate legal opt-out filings (CCPA, GDPR, DPDP), and voluntarily share anonymized, aggregated public safety data sealed on an immutable cryptographic ledger.",
  keywords: "Data Privacy, Opt-Out, Data Brokers, CCPA, GDPR, DPDP, Cryptographic Ledger, SafeShare, Data Anonymization",
  authors: [{ name: "DataVault Project" }],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

