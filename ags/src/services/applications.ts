import Gio from "gi://Gio?version=2.0"
import GioUnix from "gi://GioUnix?version=2.0"

export interface CatInfo {
  label: string
  icon: string
  cssClass: string
}

export interface AppEntry {
  type: "app"
  info: GioUnix.DesktopAppInfo
  name: string
  description: string
  iconName: string
  cat: CatInfo
}

const CATEGORY_MAP: Record<string, CatInfo> = {
  Graphics:        { label: "GRÁFICAS",    icon: "󰩬", cssClass: "graficas" },
  Image:           { label: "GRÁFICAS",    icon: "󰩬", cssClass: "graficas" },
  TerminalEmulator:{ label: "TERMINAL",    icon: "󱃖", cssClass: "terminal" },
  ConsoleOnly:     { label: "TERMINAL",    icon: "󱃖", cssClass: "terminal" },
  Utility:         { label: "UTILIDADES",  icon: "󰙨", cssClass: "utilidades" },
  Accessories:     { label: "UTILIDADES",  icon: "󰙨", cssClass: "utilidades" },
  Development:     { label: "DESARROLLO",  icon: "󰧨", cssClass: "desarrollo" },
  IDE:             { label: "DESARROLLO",  icon: "󰧨", cssClass: "desarrollo" },
  Network:         { label: "INTERNET",    icon: "󰖟", cssClass: "internet" },
  WebBrowser:      { label: "INTERNET",    icon: "󰖟", cssClass: "internet" },
  Office:          { label: "OFICINA",     icon: "󰲨", cssClass: "oficina" },
  Game:            { label: "JUEGOS",      icon: "󰊴", cssClass: "juegos" },
  Audio:           { label: "MULTIMEDIA",  icon: "󰝚", cssClass: "multimedia" },
  Video:           { label: "MULTIMEDIA",  icon: "󰝚", cssClass: "multimedia" },
  Music:           { label: "MULTIMEDIA",  icon: "󰝚", cssClass: "multimedia" },
  Settings:        { label: "SISTEMA",     icon: "󰒓", cssClass: "sistema" },
  System:          { label: "SISTEMA",     icon: "󰒓", cssClass: "sistema" },
}

const CATEGORY_ORDER = [
  "GRÁFICAS", "TERMINAL", "UTILIDADES", "DESARROLLO",
  "INTERNET", "MULTIMEDIA", "OFICINA", "JUEGOS", "SISTEMA", "OTRAS",
]

function getCategory(catName: string): CatInfo {
  return CATEGORY_MAP[catName] || {
    label: "OTRAS",
    icon: "󰉐",
    cssClass: "otras",
  }
}

function getIconName(info: Gio.AppInfo): string {
  const icon = info.get_icon()
  if (!icon) return "application-x-executable"
  if (icon instanceof Gio.ThemedIcon) {
    const names = icon.get_names()
    return names?.[0] ?? "application-x-executable"
  }
  return icon.to_string?.() ?? "application-x-executable"
}

let _cachedAllApps: AppEntry[] | null = null

export function getAllApps(): AppEntry[] {
  if (_cachedAllApps) return _cachedAllApps

  const all: AppEntry[] = []
  for (const info of Gio.AppInfo.get_all()) {
    if (!info.should_show()) continue
    if (!(info instanceof GioUnix.DesktopAppInfo)) continue

    const isTerm = info.get_boolean("Terminal")
    const raw = info.get_categories?.() ?? ""
    const cat = isTerm ? "TerminalEmulator" : (raw.split(";").filter(Boolean)[0] || "Utility")

    all.push({
      type: "app",
      info,
      name: info.get_display_name() ?? info.get_name() ?? "?",
      description: info.get_description() ?? info.get_generic_name() ?? info.get_executable() ?? "",
      iconName: getIconName(info),
      cat: getCategory(cat),
    })
  }
  _cachedAllApps = all
  return all
}

export function getUniqueCategories(apps: AppEntry[]): CatInfo[] {
  const map = new Map<string, CatInfo>()
  for (const app of apps) {
    map.set(app.cat.label, app.cat)
  }

  const ordered: CatInfo[] = []
  const added = new Set<string>()

  for (const label of CATEGORY_ORDER) {
    if (map.has(label)) {
      ordered.push(map.get(label)!)
      added.add(label)
    }
  }

  for (const [label, cat] of map) {
    if (!added.has(label)) {
      ordered.push(cat)
    }
  }

  return ordered
}
