"use client"

import React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "./app-sidebar"
import SearchBar from "./search-bar"
import ResultsGrid from "./results-grid"
import MiniPlayer from "./mini-player"
import { PlayerProvider } from "./player-context"
import { PlaylistProvider } from "./playlist-context"
import { motion } from "framer-motion"
import HomeContent from "./home-content"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import BackgroundWaves from "./background-waves" 

export default function MusicApp() {
  const [query, setQuery] = React.useState("")

  return (
      <PlayerProvider>
        <div className="min-h-svh bg-neutral-950 text-neutral-100 relative overflow-hidden">
          {/* Background Waves Component */}
          <BackgroundWaves />

          <SidebarProvider defaultOpen>
            <AppSidebar />
            <SidebarInset className="relative">
              <motion.header
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 16, mass: 0.7 }}
                className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/65 bg-neutral-950/60 border-b border-neutral-800"
              >
                <SidebarTrigger />
                <div className="flex-1 max-w-3xl">
                  <SearchBar defaultValue={query} onChange={setQuery} />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Avatar className="size-8 bg-purple-600 text-white">
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                  <Button variant="secondary" className="rounded-full bg-[#1DB954] text-black hover:bg-[#19a94f]">
                    All
                  </Button>
                  <Button variant="secondary" className="rounded-full bg-neutral-800 hover:bg-neutral-700">
                    Music
                  </Button>
                  <Button variant="secondary" className="rounded-full bg-neutral-800 hover:bg-neutral-700">
                    Podcasts
                  </Button>
                </div>
              </motion.header>

              <main className="px-4 sm:px-6 py-4 relative">
                {query.trim().length === 0 ? <HomeContent /> : <ResultsGrid query={query} />}
              </main>

              <MiniPlayer />
            </SidebarInset>
          </SidebarProvider>
        </div>
      </PlayerProvider>
  )
}
