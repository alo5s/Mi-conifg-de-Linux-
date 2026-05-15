import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"
import GdkPixbuf from "gi://GdkPixbuf?version=2.0"

export interface WallpaperInfo {
  url: string
  path: string
  type: "image" | "video"
  timestamp: number
  width?: number
  height?: number
  thumbPath?: string
}

const CONFIG_DIR = `${GLib.get_user_config_dir()}/ags`
const WALLPAPERS_DIR = `${CONFIG_DIR}/wallpapers`
const STATE_PATH = `${CONFIG_DIR}/wallpaper.json`
const THUMB_CACHE_DIR = `${GLib.get_home_dir()}/.cache/ags/wallpaper-thumbs`

const IMAGE_EXT = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"]
const VIDEO_EXT = [".mp4", ".webm", ".mov", ".mkv"]

function ensureDirs() {
  GLib.mkdir_with_parents(WALLPAPERS_DIR, 0o755)
}

function ensureThumbDir() {
  GLib.mkdir_with_parents(THUMB_CACHE_DIR, 0o755)
}

function detectType(path: string): "image" | "video" {
  const lower = path.toLowerCase()
  if (IMAGE_EXT.some(e => lower.endsWith(e))) return "image"
  if (VIDEO_EXT.some(e => lower.endsWith(e))) return "video"
  return "image"
}

function getImageSize(path: string): { width: number; height: number } | null {
  try {
    const hasIdentify = GLib.find_program_in_path("identify")
    if (hasIdentify) {
      const [ok, stdout] = GLib.spawn_command_line_sync(
        `identify -format "%w %h" ${GLib.shell_quote(path)}`
      )
      if (ok && stdout) {
        const out = new TextDecoder().decode(stdout).trim()
        const parts = out.split(" ")
        const w = parseInt(parts[0]), h = parseInt(parts[1])
        if (!isNaN(w) && !isNaN(h)) return { width: w, height: h }
      }
    }
    const pixbuf = GdkPixbuf.Pixbuf.new_from_file(path)
    if (pixbuf) return { width: pixbuf.width, height: pixbuf.height }
  } catch {}
  return null
}

export function getThumbnail(path: string): string {
  ensureThumbDir()
  const basename = (path.split("/").pop() || "thumb") + ".jpg"
  const thumbPath = `${THUMB_CACHE_DIR}/${basename}`
  if (GLib.file_test(thumbPath, GLib.FileTest.EXISTS)) return thumbPath
  const hasConvert = GLib.find_program_in_path("convert")
  if (hasConvert) {
    GLib.spawn_command_line_sync(
      `convert ${GLib.shell_quote(path)} -resize "320x240>" -strip -quality 85 ${GLib.shell_quote(thumbPath)}`
    )
    if (GLib.file_test(thumbPath, GLib.FileTest.EXISTS)) return thumbPath
  }
  return path
}

function downloadFile(url: string, dest: string): string | null {
  try {
    if (!GLib.find_program_in_path("curl"))
      return "curl no está instalado. Instálalo para descargar wallpapers."

    const quotedDest = GLib.shell_quote(dest)
    const quotedUrl = GLib.shell_quote(url)
    const cmd = `curl -fsSL --max-time 30 -o ${quotedDest} ${quotedUrl}`
    const [ok, , stderr, status] = GLib.spawn_command_line_sync(cmd)
    if (ok && status === 0 && GLib.file_test(dest, GLib.FileTest.EXISTS)) {
      const [, content] = GLib.file_get_contents(dest)
      if (content && content.length > 100) return null
      return "Archivo descargado vacío o corrupto"
    }
    const errMsg = stderr ? new TextDecoder().decode(stderr).trim() : ""
    if (errMsg.includes("404")) return "URL no encontrada (404)"
    if (errMsg.includes("Connection refused")) return "Conexión rechazada"
    if (errMsg.includes("Could not resolve")) return "No se pudo resolver el dominio"
    return `Error al descargar${errMsg ? ": " + errMsg.split("\n")[0] : ""}`
  } catch {
    return "Error inesperado al descargar"
  }
}

function applyImage(path: string): boolean {
  const hasAwww = GLib.find_program_in_path("awww")
  if (hasAwww) {
    const [ok] = GLib.spawn_command_line_sync(`awww img ${GLib.shell_quote(path)}`)
    return ok
  }
  const hasSwww = GLib.find_program_in_path("swww")
  if (hasSwww) {
    const [ok] = GLib.spawn_command_line_sync(`swww img ${GLib.shell_quote(path)}`)
    return ok
  }
  const hasFeh = GLib.find_program_in_path("feh")
  if (hasFeh) {
    const [ok] = GLib.spawn_command_line_sync(`feh --bg-fill ${GLib.shell_quote(path)}`)
    return ok
  }
  return false
}

export function ensureWallpaperDaemon() {
  if (!GLib.find_program_in_path("awww")) return
  GLib.mkdir_with_parents(`${GLib.get_home_dir()}/.cache/awww`, 0o755)
  const [, stdout] = GLib.spawn_command_line_sync("pgrep -x awww-daemon")
  if (!stdout || stdout.length === 0) {
    GLib.spawn_command_line_async("awww-daemon")
  }
}

function applyVideo(path: string): boolean {
  const hasMpvpaper = GLib.find_program_in_path("mpvpaper")
  if (hasMpvpaper) {
    GLib.spawn_command_line_async(`mpvpaper '*' ${GLib.shell_quote(path)}`)
    return true
  }
  return false
}

function optimizeImage(path: string) {
  if (detectType(path) !== "image") return
  const hasConvert = GLib.find_program_in_path("convert")
  if (hasConvert) {
    GLib.spawn_command_line_sync(
      `convert ${GLib.shell_quote(path)} -resize "1920x1080>" -strip ${GLib.shell_quote(path)}`
    )
  }
}

function buildInfo(filePath: string): WallpaperInfo {
  const basename = filePath.split("/").pop() || ""
  const type = detectType(filePath)
  const size = type === "image" ? getImageSize(filePath) : null
  const thumbPath = type === "image" ? getThumbnail(filePath) : filePath
  return {
    url: basename,
    path: filePath,
    type,
    timestamp: Date.now(),
    width: size?.width,
    height: size?.height,
    thumbPath,
  }
}

function saveState(info: WallpaperInfo) {
  try {
    GLib.file_set_contents(STATE_PATH, JSON.stringify(info))
  } catch {}
}

export function importFile(src: string): string {
  ensureDirs()
  const file = Gio.File.new_for_path(src)
  const basename = file.get_basename() || "wallpaper"
  const nameBase = basename.replace(/\.[^.]+$/, "")
  const extMatch = basename.match(/\.([^.]+)$/)
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : ".jpg"
  const slug = nameBase.replace(/[^a-z0-9]/gi, "-").toLowerCase()
  let destPath = `${WALLPAPERS_DIR}/${slug}${ext}`
  let counter = 1
  while (GLib.file_test(destPath, GLib.FileTest.EXISTS)) {
    destPath = `${WALLPAPERS_DIR}/${slug}-${counter}${ext}`
    counter++
  }
  try {
    file.copy(Gio.File.new_for_path(destPath), Gio.FileCopyFlags.OVERWRITE, null)
  } catch {
    return "Error al copiar el archivo"
  }
  const type = detectType(destPath)
  if (type === "image") {
    optimizeImage(destPath)
    ensureWallpaperDaemon()
    if (!applyImage(destPath)) return "No se pudo aplicar el wallpaper"
  } else {
    if (!applyVideo(destPath)) return "No se pudo aplicar el video"
  }
  const info = buildInfo(destPath)
  saveState(info)
  return "Wallpaper aplicado"
}

export function getWallpaper(): WallpaperInfo | null {
  if (!GLib.file_test(STATE_PATH, GLib.FileTest.EXISTS)) return null
  try {
    const [, content] = GLib.file_get_contents(STATE_PATH)
    if (!content) return null
    const decoder = new TextDecoder()
    return JSON.parse(decoder.decode(content)) as WallpaperInfo
  } catch {
    return null
  }
}

export function setWallpaper(url: string): string {
  ensureDirs()

  const urlPath = url.split("?")[0].split("#")[0]
  const segments = urlPath.split("/")
  const last = segments[segments.length - 1]
  const nameBase = last ? last.replace(/\.[^.]+$/, "") : ""
  const slug = nameBase.length >= 2
    ? nameBase.replace(/[^a-z0-9]/gi, "-").toLowerCase()
    : urlPath.replace(/https?:\/\//, "").replace(/[^a-z0-9]/gi, "-").toLowerCase()
  const extMatch = url.match(/\.(png|jpg|jpeg|gif|bmp|webp|mp4|webm|mov|mkv)(\?|$)/i)
  const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : ".jpg"
  const filePath = `${WALLPAPERS_DIR}/${slug}${ext}`

  const err = downloadFile(url, filePath)
  if (err) return err

  const type = detectType(filePath)

  if (type === "image") {
    optimizeImage(filePath)
    ensureWallpaperDaemon()
    const applied = applyImage(filePath)
    if (!applied) return "No se encontró awww ni swww ni feh para aplicar el wallpaper"
  } else {
    const applied = applyVideo(filePath)
    if (!applied) return "No se encontró mpvpaper para aplicar el video"
  }

  const info = buildInfo(filePath)
  saveState(info)

  return type === "image" ? "Wallpaper aplicado" : "Video wallpaper aplicado"
}

export function getAllWallpapers(): WallpaperInfo[] {
  ensureDirs()
  const wallpapers: WallpaperInfo[] = []
  const dir = Gio.File.new_for_path(WALLPAPERS_DIR)
  if (!dir.query_exists(null)) return wallpapers

  try {
    const enumerator = dir.enumerate_children(
      "standard::name", Gio.FileQueryInfoFlags.NONE, null
    )
    let info: Gio.FileInfo | null
    while ((info = enumerator.next_file(null)) !== null) {
      const name = info.get_name()
      if (name === "." || name === "..") continue
      const filePath = `${WALLPAPERS_DIR}/${name}`
      wallpapers.push(buildInfo(filePath))
    }
  } catch {}

  wallpapers.sort((a, b) => a.url.localeCompare(b.url))
  return wallpapers
}

export function applyExisting(path: string): boolean {
  if (!GLib.file_test(path, GLib.FileTest.EXISTS)) return false
  const type = detectType(path)

  if (type === "image") {
    ensureWallpaperDaemon()
    if (!applyImage(path)) return false
  } else {
    if (!applyVideo(path)) return false
  }

  const info = buildInfo(path)
  saveState(info)
  return true
}

export function deleteWallpaper(path: string): boolean {
  try {
    const file = Gio.File.new_for_path(path)
    file.delete(null)

    const current = getWallpaper()
    if (current && current.path === path) {
      try { GLib.remove(STATE_PATH) } catch {}
    }

    const thumbBasename = (path.split("/").pop() || "thumb") + ".jpg"
    const thumbPath = `${THUMB_CACHE_DIR}/${thumbBasename}`
    if (GLib.file_test(thumbPath, GLib.FileTest.EXISTS)) {
      try { GLib.remove(thumbPath) } catch {}
    }

    return true
  } catch {
    return false
  }
}

export function getRandomWallpaper(): WallpaperInfo | null {
  const all = getAllWallpapers()
  if (all.length === 0) return null
  const current = getWallpaper()
  const others = current ? all.filter(w => w.path !== current.path) : all
  if (others.length === 0) return all[0]
  return others[Math.floor(Math.random() * others.length)]
}
