import { createState, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

const ICONS: Record<string, string> = {
  "100": "󰁹", "90": "󰂂", "80": "󰂁", "70": "󰂀",
  "60": "󰁿", "50": "󰁾", "40": "󰁽", "30": "󰁼",
  "20": "󰁻", "10": "󰁺",
}

function getIcon(capacity: number, charging: boolean): string {
  if (charging) return "󰂄"
  const key = Math.floor(capacity / 10) * 10
  return ICONS[String(key)] || "󰁺"
}

export default function Battery() {
  const [capacity, setCapacity] = createState(0)
  const [charging, setCharging] = createState(false)

  const icon = createComputed(() => getIcon(capacity(), charging()))
  const capText = createComputed(() => `${capacity()}%`)

  function poll() {
    try {
      const [, cap] = GLib.file_get_contents("/sys/class/power_supply/BAT0/capacity")
      if (cap) setCapacity(Math.min(100, parseInt(new TextDecoder().decode(cap).trim(), 10)))
      const [, st] = GLib.file_get_contents("/sys/class/power_supply/BAT0/status")
      if (st) setCharging(new TextDecoder().decode(st).trim() === "Charging")
    } catch {}
  }

  function onRealize() {
    poll()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, () => {
      poll()
      return GLib.SOURCE_CONTINUE
    })
  }

  return (
    <box class="bar-module" onRealize={onRealize} spacing={2}>
      <label class="bar-icon" label={icon} />
      <label label={capText} />
    </box>
  )
}
