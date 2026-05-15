import { CustomGroup } from "./custom-launchers"
import { CatInfo } from "./apps"

export type View =
  | { type: "main" }
  | { type: "section"; id: string; title: string }
  | { type: "category"; sectionId: string; label: string; cat: CatInfo }
  | { type: "web" }
  | { type: "custom" }
  | { type: "custom-group"; group: CustomGroup }
  | { type: "settings" }
  | { type: "wallpaper" }
  | { type: "files"; query: string }

export interface MainMenuItem {
  id: string
  title: string
  icon: string
  desc: string
}

export interface SettingsItem {
  id: string
  title: string
  icon: string
  desc: string
}

export interface CalcInfo {
  expr: string
  result: number
}

export const MAIN_MENU: MainMenuItem[] = [
  { id: "apps", title: "Apps", icon: "󰀻", desc: "Todas las aplicaciones" },
  { id: "files", title: "Archivos", icon: "󰉏", desc: "Buscar archivos" },
  { id: "navegar", title: "Navegar", icon: "󰖟", desc: "Abrir Brave" },
  { id: "programa", title: "Programa", icon: "󰄵", desc: "Abrir Neovim" },
  { id: "tools", title: "Herramientas", icon: "󰚀", desc: "IA, Scripts y más" },
  { id: "settings", title: "Config.", icon: "󰒓", desc: "Ajustes del sistema" },
]

export const SETTINGS_ITEMS: SettingsItem[] = [
  { id: "wallpaper", title: "Wallpaper", icon: "󰸉", desc: "Galería y descarga de wallpapers" },
]

export const CALC_HINTS = [
  { key: "↵", desc: "Copiar" },
  { key: "Esc", desc: "Limpiar" },
]

export const SEARCH_HINTS = [
  { key: "↵", desc: "Abrir" },
  { key: "↑↓", desc: "Navegar" },
  { key: "Esc", desc: "Limpiar" },
]

export const MAIN_HINTS = [
  { key: "↵", desc: "Entrar" },
  { key: "↑↓", desc: "Navegar" },
  { key: "Esc", desc: "Cerrar" },
]

export const SECTION_HINTS = [
  { key: "↵", desc: "Entrar" },
  { key: "↑↓", desc: "Navegar" },
  { key: "←", desc: "Atrás" },
  { key: "Esc", desc: "Cerrar" },
]

export const CATEGORY_HINTS = [
  { key: "↵", desc: "Abrir" },
  { key: "↑↓", desc: "Navegar" },
  { key: "←", desc: "Atrás" },
  { key: "Esc", desc: "Cerrar" },
]

export function evaluateCalc(text: string): CalcInfo | null {
  const q = text.trim().replace(/\s/g, "")
  if (!q || !/^[\d+\-*/().^,%]+$/.test(q)) return null

  try {
    const result = Function(`"use strict"; return (${q.replace(/\^/g, "**")})`)()
    if (typeof result !== "number" || !isFinite(result)) return null
    return { expr: q, result }
  } catch {
    return null
  }
}
