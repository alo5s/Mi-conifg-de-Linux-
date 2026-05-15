import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"

export interface WebAppEntry {
  name: string
  url: string
  icon: string
  desktopPath: string
  slug: string
}

const APPS_DIR = `${GLib.get_home_dir()}/.local/share/applications`
const ICONS_DIR = `${APPS_DIR}/icons`

function ensureDirs() {
  GLib.mkdir_with_parents(ICONS_DIR, 0o755)
}

export function getBrowser(): string {
  const env = GLib.getenv("BROWSER")
  if (env) {
    const bins = env.split(":")
    for (const b of bins) {
      const trimmed = b.trim()
      if (trimmed && GLib.find_program_in_path(trimmed)) return trimmed
    }
  }

  const browsers = [
    "chromium", "google-chrome-stable", "google-chrome",
    "brave", "firefox", "vivaldi", "edge",
  ]
  for (const b of browsers) {
    if (GLib.find_program_in_path(b)) return b
  }

  const [ok, stdout] = GLib.spawn_command_line_sync(
    "xdg-settings get default-web-browser"
  )
  if (ok && stdout) {
    const desktop = new TextDecoder().decode(stdout).trim().replace(/\.desktop$/, "")
    const fromDesktop = desktop.split(".").pop() || desktop
    if (GLib.find_program_in_path(fromDesktop)) return fromDesktop
  }

  return "xdg-open"
}

function sanitize(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function downloadFile(url: string, dest: string): boolean {
  try {
    const cmd = `curl -fsSL --max-time 8 -o ${GLib.shell_quote(dest)} ${GLib.shell_quote(url)}`
    const [ok, , , status] = GLib.spawn_command_line_sync(cmd)
    if (ok && status === 0 && GLib.file_test(dest, GLib.FileTest.EXISTS)) {
      const [, content] = GLib.file_get_contents(dest)
      if (content && content.length > 100) return true
    }
  } catch {}
  return false
}

function createSvgIcon(name: string): string {
  ensureDirs()
  const svgPath = `${ICONS_DIR}/${sanitize(name)}.svg`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#89b4fa">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
</svg>`
  GLib.file_set_contents(svgPath, svg)
  return svgPath
}

function fetchIcon(name: string, url: string): string {
  ensureDirs()
  const slug = sanitize(name)
  const iconPath = `${ICONS_DIR}/${slug}.png`

  if (GLib.file_test(iconPath, GLib.FileTest.EXISTS)) return iconPath

  const domain = url.replace(/https?:\/\//, "").split("/")[0]

  const urls = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://${domain}/favicon.ico`,
    `https://${domain}/apple-touch-icon.png`,
  ]

  for (const fav of urls) {
    if (downloadFile(fav, iconPath)) return iconPath
  }

  return createSvgIcon(name)
}

let _cachedWebApps: WebAppEntry[] | null = null

export function getInstalledWebApps(force = false): WebAppEntry[] {
  if (_cachedWebApps && !force) return _cachedWebApps

  const apps: WebAppEntry[] = []
  const dir = Gio.File.new_for_path(APPS_DIR)
  if (!dir.query_exists(null)) { _cachedWebApps = apps; return apps }

  const enumerator = dir.enumerate_children(
    "standard::name", Gio.FileQueryInfoFlags.NONE, null
  )

  let info: Gio.FileInfo | null
  while ((info = enumerator.next_file(null)) !== null) {
    const fileName = info.get_name()
    if (!fileName.endsWith(".desktop")) continue

    const child = dir.get_child(fileName)
    const keyFile = new GLib.KeyFile()
    try {
      keyFile.load_from_file(child.get_path(), GLib.KeyFileFlags.NONE)
      const exec = keyFile.get_value("Desktop Entry", "Exec")
      if (!exec.includes("WebApp.")) continue

      const displayName = keyFile.get_value("Desktop Entry", "Name")
      const icon = keyFile.get_value("Desktop Entry", "Icon")
      const urlMatch = exec.match(/--app=(https?:\/\/[^\s]+)/)

      const slug = fileName.replace(/\.desktop$/, "")

      apps.push({
        name: displayName,
        url: urlMatch?.[1] ?? "",
        icon: icon || "web-browser",
        desktopPath: child.get_path(),
        slug,
      })
    } catch {
      continue
    }
  }
  _cachedWebApps = apps
  return apps
}

export function installWebApp(name: string, url: string): boolean {
  if (!name || !url) return false

  if (!url.startsWith("http")) url = `https://${url}`

  const slug = sanitize(name)
  const icon = fetchIcon(name, url)
  const browser = getBrowser()

  const desktopFile = `[Desktop Entry]
Version=1.0
Name=${name}
Comment=${name} Web App
Exec=${browser} --app=${url} --class=WebApp.${slug} --disable-features=GlobalMediaControlsCastStartStop
Terminal=false
Type=Application
Icon=${icon}
StartupNotify=true
StartupWMClass=WebApp.${slug}
Categories=Network;WebApplication;
`

  const desktopPath = `${APPS_DIR}/${slug}.desktop`
  try {
    GLib.file_set_contents(desktopPath, desktopFile)
    GLib.chmod(desktopPath, 0o755)
    GLib.spawn_command_line_sync(`update-desktop-database ${GLib.shell_quote(APPS_DIR)}`)
    return true
  } catch {
    return false
  }
}

export function uninstallWebApp(app: WebAppEntry): boolean {
  try {
    const keyFile = new GLib.KeyFile()
    keyFile.load_from_file(app.desktopPath, GLib.KeyFileFlags.NONE)
    const iconFile = keyFile.get_value("Desktop Entry", "Icon")
    if (iconFile && GLib.file_test(iconFile, GLib.FileTest.EXISTS) && !iconFile.startsWith("/usr/")) {
      try { GLib.remove(iconFile) } catch {}
      if (iconFile.endsWith(".png")) {
        try { GLib.remove(iconFile.replace(/\.png$/, ".svg")) } catch {}
      }
    }

    const file = Gio.File.new_for_path(app.desktopPath)
    file.delete(null)

    GLib.spawn_command_line_sync(`update-desktop-database ${GLib.shell_quote(APPS_DIR)}`)
    return true
  } catch {
    return false
  }
}
