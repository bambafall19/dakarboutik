"use client"

import * as React from "react"
import { Snowflake } from "lucide-react"
import { useSnow } from "@/hooks/use-snow"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SnowToggleButton() {
  const { isSnowing, toggleSnow } = useSnow();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSnow}
      title={isSnowing ? "Arrêter la neige" : "Activer la neige"}
    >
      <Snowflake className={cn("h-6 w-6 transition-colors", isSnowing ? "text-blue-400 fill-blue-300" : "")} />
      <span className="sr-only">{isSnowing ? "Arrêter la neige" : "Activer la neige"}</span>
    </Button>
  )
}
