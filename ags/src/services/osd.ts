import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"

export interface OSDState {
  visible: boolean
  type: "volume" | "brightness"
  value: number
  muted: boolean
}

let osdTimer = 0
let lastVolume = -1
let lastMuted = false
let lastBrightness = -1
let onUpdate: ((state: OSDState) => void) | null = null
let pollId = 0
let monitor: Gio.FileMonitor | null = null

function showOSD(type: "volume" | "brightness", value: number, muted: boolean) {
  console.log(`[OSD] show type=${type} value=${value} muted=${muted}`)
  if (!onUpdate) return
  onUpdate({ visible: true, type, value, muted })
  if (osdTimer > 0) GLib.source_remove(osdTimer)
  osdTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
    if (onUpdate) onUpdate({ visible: false, type, value, muted })
    osdTimer = 0
    return GLib.SOURCE_REMOVE
  })
}

function getVolume(): { value: number; muted: boolean } {
  try {
    const [ok, stdout] = GLib.spawn_command_line_sync(
      "wpctl get-volume @DEFAULT_AUDIO_SINK@"
    )
    if (ok && stdout) {
      const str = new TextDecoder().decode(stdout).trim()
      const match = str.match(/Volume: ([\d.]+)/)
      if (match) {
        const value = Math.round(parseFloat(match[1]) * 100)
        const muted = str.includes("[MUTED]")
        return { value, muted }
      }
    }
  } catch { void 0; }
  return { value: 0, muted: false }
}

function getMaxBrightness(): number {
  try {
    const dir = GLib.dir_open("/sys/class/backlight")
    if (!dir) return 100
    const name = GLib.dir_read_name(dir)
    GLib.dir_close(dir)
    if (!name) return 100
    const [, content] = GLib.file_get_contents(`/sys/class/backlight/${name}/max_brightness`)
    if (content) {
      return parseInt(new TextDecoder().decode(content).trim(), 10) || 100
    }
  } catch { void 0; }
  return 100
}

function getBrightnessFromSys(max: number): number {
  try {
    const dir = GLib.dir_open("/sys/class/backlight")
    if (!dir) return 0
    const name = GLib.dir_read_name(dir)
    GLib.dir_close(dir)
    if (!name) return 0
    const [, content] = GLib.file_get_contents(`/sys/class/backlight/${name}/brightness`)
    if (content) {
      return Math.round((parseInt(new TextDecoder().decode(content).trim(), 10) / max) * 100)
    }
  } catch { void 0; }
  return 0
}

export function startOSD(callback: (state: OSDState) => void) {
  console.log("[OSD] startOSD")
  onUpdate = callback

  const vol = getVolume()
  lastVolume = vol.value
  lastMuted = vol.muted

  const maxBrightness = getMaxBrightness()
  lastBrightness = getBrightnessFromSys(maxBrightness)

  pollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
    const v = getVolume()
    if (v.value !== lastVolume || v.muted !== lastMuted) {
      lastVolume = v.value
      lastMuted = v.muted
      showOSD("volume", v.value, v.muted)
    }
    lastVolume = v.value
    lastMuted = v.muted
    return GLib.SOURCE_CONTINUE
  })

  try {
    const dir = GLib.dir_open("/sys/class/backlight")
    if (!dir) return
    const name = GLib.dir_read_name(dir)
    GLib.dir_close(dir)
    if (!name) return
    const file = Gio.File.new_for_path(`/sys/class/backlight/${name}/brightness`)
    monitor = file.monitor(Gio.FileMonitorFlags.NONE, null)
    if (monitor) {
      monitor.connect("changed", () => {
        const b = getBrightnessFromSys(maxBrightness)
        if (b !== lastBrightness) {
          lastBrightness = b
          showOSD("brightness", b, false)
        }
        lastBrightness = b
      })
    }
  } catch { void 0; }
}

export function stopOSD() {
  if (pollId > 0) { GLib.source_remove(pollId); pollId = 0 }
  if (osdTimer > 0) { GLib.source_remove(osdTimer); osdTimer = 0 }
  if (monitor) { monitor.cancel(); monitor = null }
  onUpdate = null
}
