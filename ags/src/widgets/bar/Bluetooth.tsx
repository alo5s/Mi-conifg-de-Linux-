import { createState, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

export default function Bluetooth() {
  const [on, setOn] = createState(false)

  const icon = createComputed(() => on() ? "󰂯" : "󰂯")

  function poll() {
    try {
      const [ok, out] = GLib.spawn_command_line_sync("bluetoothctl show")
      if (ok && out) {
        setOn(new TextDecoder().decode(out).includes("Powered: yes"))
      }
    } catch {}
  }

  function openBluetui() {
    GLib.spawn_command_line_async(
        "kitty --app-id floatterm --title bluetui -e bluetui"
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
    <button class="bar-module" onClicked={openBluetui} onRealize={onRealize}>
      <label class="bar-icon" label={icon} />
    </button>
  )
}
