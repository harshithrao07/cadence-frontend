import "./globals.css";
import { Outfit } from 'next/font/google'
 
const outfit = Outfit({
  subsets: ['latin'],
})

export const metadata = {
  title: "Cadence",
  description: "Stream your favorite music with our Cadence app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.className}>
      <body className="h-full"
      >
        {children}
      </body>
    </html>
  );
}
