import GLib from "gi://GLib?version=2.0"

export interface CustomLauncher {
  id: string
  name: string
  icon?: string
  desc: string
  exec: string
  terminal?: boolean
}

export interface CustomGroup {
  id: string
  title: string
  icon: string
  desc: string
  launchers: CustomLauncher[]
}

const CONFIG_PATH = `${GLib.get_user_config_dir()}/ags/launchers.json`

const DEFAULT_TERMINALS = [
  "kitty", "alacritty", "wezterm", "ghostty",
  "gnome-terminal", "konsole", "xfce4-terminal",
  "foot", "st", "urxvt", "xterm",
]

function detectTerminal(): string {
  const env = GLib.getenv("TERMINAL")
  if (env && GLib.find_program_in_path(env)) return env
  for (const t of DEFAULT_TERMINALS) {
    if (GLib.find_program_in_path(t)) return t
  }
  return "xterm"
}

export function getTerminal(): string {
  return detectTerminal()
}

function ensureDefaults() {
  if (GLib.file_test(CONFIG_PATH, GLib.FileTest.EXISTS)) return

  const defaults: CustomGroup[] = [
    {
      id: "navegadores",
      title: "Navegadores",
      icon: "󰖟",
      desc: "Abrir navegador web",
      launchers: [
        { id: "brave",  name: "Brave Beta",  icon: "󰃢", desc: "Brave Browser Beta", exec: "brave-origin-beta" },
      ],
    },
    {
      id: "programacion",
      title: "Programación",
      icon: "󰄵",
      desc: "Herramientas de desarrollo",
      launchers: [
        { id: "nvim",  name: "Neovim",   icon: "",  desc: "Editor en terminal",   exec: "nvim", terminal: true },
      ],
    },
    {
      id: "ia",
      title: "Inteligencia Artificial",
      icon: "󰭹",
      desc: "Herramientas de IA",
      launchers: [
        { id: "chatgpt", name: "ChatGPT", icon: "󰭹", desc: "ChatGPT web",              exec: "xdg-open https://chat.openai.com" },
        { id: "ollama",  name: "Ollama",  icon: "󰭹", desc: "Chat local con Ollama",    exec: "ollama run llama3", terminal: true },
        { id: "claude",  name: "Claude",  icon: "󰭹", desc: "Claude AI",                exec: "xdg-open https://claude.ai" },
      ],
    },
    {
      id: "scripts",
      title: "Mis Scripts",
      icon: "󰓫",
      desc: "Automatizaciones y tareas",
      launchers: [],
    },
  ]

  try {
    GLib.mkdir_with_parents(
      CONFIG_PATH.substring(0, CONFIG_PATH.lastIndexOf("/")),
      0o755
    )
    GLib.file_set_contents(CONFIG_PATH, JSON.stringify(defaults, null, 2))
  } catch {}
}

let _cachedGroups: CustomGroup[] | null = null

export function getGroups(force = false): CustomGroup[] {
  if (_cachedGroups && !force) return _cachedGroups
  ensureDefaults()

  try {
    const [, content] = GLib.file_get_contents(CONFIG_PATH)
    if (!content) { _cachedGroups = []; return [] }
    const parsed = JSON.parse(new TextDecoder().decode(content))
    if (!Array.isArray(parsed)) { _cachedGroups = []; return [] }
    _cachedGroups = parsed as CustomGroup[]
    return _cachedGroups
  } catch {
    _cachedGroups = []
    return []
  }
}

export function launchLauncher(launcher: CustomLauncher) {
  if (launcher.terminal) {
    const term = getTerminal()
    GLib.spawn_command_line_async(`${term} -e ${launcher.exec}`)
  } else {
    GLib.spawn_command_line_async(launcher.exec)
  }
}
