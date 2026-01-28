import { Toaster } from "sonner";
import "./globals.css";
import { Outfit } from "next/font/google";
import { ArtistsProvider } from "../context/ArtistContext";
import { GenreProvider } from "@/context/GenreContext";
import { RecordProvider } from "@/context/RecordContext";
import { SongProvider } from "@/context/SongContext";
import { UserProvider } from "@/context/UserContext";

import { PlayerProvider } from "@/context/PlayerContext";
import { MusicPlayer } from "@/components/player/MusicPlayer";
import Navbar from "@/components/Navbar";

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
                  <PlayerProvider>
                    <div className="min-h-screen flex flex-col bg-black">
                      <Navbar />
                      <main className="flex-1 pb-24">{children}</main>
                      <MusicPlayer />
                      <Toaster richColors position="top-right" />
                    </div>
                  </PlayerProvider>
                </SongProvider>
              </RecordProvider>
            </GenreProvider>
          </ArtistsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
