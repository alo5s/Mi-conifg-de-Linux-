import { createState } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

export default function Clock() {
  const [time, setTime] = createState("")

  function update() {
    const now = GLib.DateTime.new_now_local()
    setTime(now.format("%a %d %b  %H:%M"))
  }

  function onRealize() {
    update()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 30000, () => {
      update()
      return GLib.SOURCE_CONTINUE
    })
  }

  return (
    <box class="bar-module" onRealize={onRealize} spacing={4}>
      <label class="bar-icon" label="󰃭" />
      <label label={time} />
    </box>
  )
}
