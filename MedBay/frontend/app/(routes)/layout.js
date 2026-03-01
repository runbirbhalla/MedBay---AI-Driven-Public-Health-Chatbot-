import { Inter } from "next/font/google";
import "../globals.css";

// Using the Inter font for a clean, modern look
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MedBay Synergy - AI Healthcare Chatbot",
  description: "Revolutionizing healthcare with AI-powered multilingual medical assistance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-gray-900">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        {children}
      </body>
    </html>
  );
}
