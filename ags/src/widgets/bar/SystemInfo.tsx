import { createState, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

interface CpuTimes {
  idle: number
  total: number
}

function readCpu(): CpuTimes {
  const [, content] = GLib.file_get_contents("/proc/stat")
  if (!content) return { idle: 0, total: 0 }
  const line = new TextDecoder().decode(content).split("\n")[0]
  const parts = line.split(/\s+/).slice(1).map(Number)
  const idle = parts[3] + (parts[4] || 0)
  const total = parts.reduce((a, b) => a + b, 0)
  return { idle, total }
}

function readMem(): { used: number; total: number } {
  const [, content] = GLib.file_get_contents("/proc/meminfo")
  if (!content) return { used: 0, total: 0 }
  const text = new TextDecoder().decode(content)
  const totalMatch = text.match(/MemTotal:\s+(\d+)/)
  const availMatch = text.match(/MemAvailable:\s+(\d+)/)
  if (!totalMatch || !availMatch) return { used: 0, total: 0 }
  const total = parseInt(totalMatch[1], 10)
  const avail = parseInt(availMatch[1], 10)
  return { used: total - avail, total }
}

export default function SystemInfo() {
  const [cpu, setCpu] = createState(0)
  const [mem, setMem] = createState(0)

  function update() {
    const prev = readCpu()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
      const curr = readCpu()
      const totalDelta = curr.total - prev.total
      const idleDelta = curr.idle - prev.idle
      if (totalDelta > 0) {
        setCpu(Math.round(((totalDelta - idleDelta) / totalDelta) * 100))
      }
      const m = readMem()
      setMem(Math.round((m.used / m.total) * 100))
      return GLib.SOURCE_REMOVE
    })
  }

  function openBtop() {
    GLib.spawn_command_line_async(
        "kitty --app-id floatterm --title btop -e btop"
    )
  }

  function onRealize() {
    update()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
      update()
      return GLib.SOURCE_CONTINUE
    })
  }

  return (
    <button class="bar-module" onClicked={openBtop} onRealize={onRealize}>
      <label class="bar-icon" label="󰍛" />
    </button>
  )
}
