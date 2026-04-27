"use client"

import { createContext, useContext, useState } from "react"

const ChurchContext = createContext<any>(null)

export function ChurchProvider({ children }: { children: React.ReactNode }) {
  const [selectedChurchId, setSelectedChurchId] = useState("")

  return (
    <ChurchContext.Provider value={{ selectedChurchId, setSelectedChurchId }}>
      {children}
    </ChurchContext.Provider>
  )
}

export function useChurch() {
  return useContext(ChurchContext)
}