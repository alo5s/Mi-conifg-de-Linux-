import { For, createState, createComputed } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0"

interface HyprWorkspace {
  id: number
  name: string
  windows: number
}

export default function Workspaces() {
  const [workspaces, setWorkspaces] = createState<HyprWorkspace[]>([])
  const [active, setActive] = createState(1)

  function poll() {
    try {
      const [ok, out] = GLib.spawn_command_line_sync("hyprctl workspaces -j")
      if (ok && out) {
        const list = JSON.parse(new TextDecoder().decode(out)) as HyprWorkspace[]
        setWorkspaces(list.sort((a, b) => a.id - b.id))
      }
      const [ok2, out2] = GLib.spawn_command_line_sync("hyprctl activeworkspace -j")
      if (ok2 && out2) {
        const act = JSON.parse(new TextDecoder().decode(out2))
        setActive(act.id)
      }
    } catch {}
  }

  function switchTo(id: number) {
    GLib.spawn_command_line_async(`hyprctl dispatch workspace ${id}`)
  }

  function onRealize() {
    poll()
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
      poll()
      return GLib.SOURCE_CONTINUE
    })
  }

  return (
    <box onRealize={onRealize} spacing={2}>
      <For each={workspaces}>
        {(ws) => {
          const btnClass = createComputed(() =>
            "bar-workspace-btn" + (active() === ws.id ? " active" : ws.windows > 0 ? " occupied" : "")
          )
          return (
            <button class={btnClass} onClicked={() => switchTo(ws.id)}>
              <label label={ws.name} />
            </button>
          )
        }}
      </For>
    </box>
  )
}
