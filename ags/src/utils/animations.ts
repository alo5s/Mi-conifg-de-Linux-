import GLib from "gi://GLib?version=2.0"
import { Gtk } from "ags/gtk4"

export function scrollAdjustmentTo(adj: Gtk.Adjustment, target: number) {
  const start = adj.get_value()
  const diff = target - start
  const duration = 120
  const steps = 10
  let step = 0

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, duration / steps, () => {
    step++
    adj.set_value(start + diff * (step / steps))
    if (step >= steps) return GLib.SOURCE_REMOVE
    return GLib.SOURCE_CONTINUE
  })
}
