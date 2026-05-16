import { createState, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

export default function Network() {
  const [connected, setConnected] = createState(false)

  const icon = createComputed(() => connected() ? "󰤨" : "󰤨")

  function poll() {
    try {
      const [, out] = GLib.spawn_command_line_sync("iwgetid -r")
      setConnected(out ? new TextDecoder().decode(out).trim().length > 0 : false)
    } catch {}
  }

  function openImpala() {
    GLib.spawn_command_line_async(
        "kitty --app-id floatterm --title impala -e impala"
    )
  }

  function onRealize() {
    poll()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10000, () => {
      poll()
      return GLib.SOURCE_CONTINUE
    })
  }

  return (
    <button class="bar-module" onClicked={openImpala} onRealize={onRealize}>
      <label class="bar-icon" label={icon} />
    </button>
  )
}
