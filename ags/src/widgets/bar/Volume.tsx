import { createState, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

export default function Volume() {
  const [level, setLevel] = createState(0)
  const [muted, setMuted] = createState(false)

  const icon = createComputed(() => muted() ? "󰝟" : level() > 66 ? "󰕾" : level() > 33 ? "󰖀" : "󰕿")
  const levelText = createComputed(() => `${level()}%`)

  function poll() {
    try {
      const [ok, out] = GLib.spawn_command_line_sync("wpctl get-volume @DEFAULT_AUDIO_SINK@")
      if (ok && out) {
        const str = new TextDecoder().decode(out).trim()
        const match = str.match(/Volume: ([\d.]+)/)
        if (match) {
          setLevel(Math.round(parseFloat(match[1]) * 100))
          setMuted(str.includes("[MUTED]"))
        }
      }
    } catch {}
  }

  function toggleMute() {
    GLib.spawn_command_line_async(`wpctl set-mute @DEFAULT_AUDIO_SINK@ ${muted() ? "0" : "1"}`)
  }

  function onRealize() {
    poll()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
      poll()
      return GLib.SOURCE_CONTINUE
    })
  }

  return (
    <button class="bar-module" onClicked={toggleMute} onRealize={onRealize}>
      <box spacing={4}>
        <label class="bar-icon" label={icon} />
        <label label={levelText} />
      </box>
    </button>
  )
}
