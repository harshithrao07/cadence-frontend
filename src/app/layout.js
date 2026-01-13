import { Toaster } from "sonner";
import "./globals.css";
import { Outfit } from "next/font/google";
import { ArtistsProvider } from "../context/ArtistContext";
import { GenreProvider } from "@/context/GenreContext";
import { RecordProvider } from "@/context/RecordContext";
import { SongProvider } from "@/context/SongContext";
import { UserProvider } from "@/context/UserContext";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "Cadence",
  description: "Stream your favorite music with our Cadence app.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.className}>
      <body>
        <UserProvider>
          <ArtistsProvider>
            <GenreProvider>
              <RecordProvider>
                <SongProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </SongProvider>
              </RecordProvider>
            </GenreProvider>
          </ArtistsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
