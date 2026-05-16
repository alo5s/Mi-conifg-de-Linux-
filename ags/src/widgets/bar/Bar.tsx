import { Astal, Gtk } from "ags/gtk4"
import App from "ags/gtk4/app"
import Workspaces from "./Workspaces"
import Volume from "./Volume"
import SystemInfo from "./SystemInfo"
import Network from "./Network"
import Bluetooth from "./Bluetooth"
import Battery from "./Battery"
import Clock from "./Clock"

const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

export default function Bar() {
  return (
    <window
      name="bar"
      anchor={TOP | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
      application={App}
      visible
    >
      <box name="bar-box" hexpand>
        <box halign={Gtk.Align.START} hexpand spacing={2}>
          <Workspaces />
        </box>
        <box halign={Gtk.Align.CENTER}>
          <Clock />
        </box>
        <box halign={Gtk.Align.END} hexpand spacing={2}>
          <Volume />
          <box class="bar-separator" />
          <SystemInfo />
          <box class="bar-separator" />
          <Network />
          <box class="bar-separator" />
          <Bluetooth />
          <box class="bar-separator" />
          <Battery />
        </box>
      </box>
    </window>
  )
}
