import { createComputed, createState, onCleanup } from "ags"
import { Astal, Gtk } from "ags/gtk4"
import { startOSD, stopOSD, OSDState } from "../services/osd"

const { TOP } = Astal.WindowAnchor

export default function OSD() {
  const [state, setState] = createState<OSDState>({
    visible: false, type: "volume", value: 0, muted: false,
  })

  startOSD(setState)
  onCleanup(stopOSD)

  const icon = createComputed(() => {
    if (state.type === "brightness") return "☀"
    return state.muted ? "🔇" : "🔊"
  })

  return (
    <window
      name="osd"
      anchor={TOP}
      exclusivity={Astal.Exclusivity.NORMAL}
      visible={state.visible}
      keymode={Astal.Keymode.NONE}
      margin-top={120}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={8}
        class="osd-box"
        halign={Gtk.Align.CENTER}
      >
        <label class="osd-icon" label={icon} />
        <levelbar
          value={state.value}
          min-value={0}
          max-value={100}
          class="osd-level"
          width-request={180}
          height-request={8}
        />
        <label class="osd-label" label={`${state.value}%`} />
      </box>
    </window>
  )
}
