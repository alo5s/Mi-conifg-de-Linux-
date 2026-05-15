import Gtk from "gi://Gtk?version=4.0"
import { intrinsicElements } from "gnim/gtk4/jsx-runtime"
intrinsicElements.picture = Gtk.Picture as Gtk.Widget

import App from "ags/gtk4/app"
import GLib from "gi://GLib?version=2.0"
import AppLauncher from "./src/widgets/launcher"
import OSD from "./src/widgets/OSD"

const cfg = GLib.get_user_config_dir()

function watchLauncherToggle() {
  const signalFile = `${GLib.get_user_runtime_dir()}/ags-launcher-toggle`
  let lastSignal = ""

  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
    try {
      if (!GLib.file_test(signalFile, GLib.FileTest.EXISTS)) return GLib.SOURCE_CONTINUE

      const [ok, content] = GLib.file_get_contents(signalFile)
      if (!ok) return GLib.SOURCE_CONTINUE

      const signal = new TextDecoder().decode(content).trim()
      if (signal && signal !== lastSignal) {
        lastSignal = signal
        App.toggle_window("launcher")
      }
    } catch (error) {
      console.error(error)
    }

    return GLib.SOURCE_CONTINUE
  })
}

App.start({
  requestHandler(request, response) {
    const command = Array.isArray(request) ? request.join(" ") : request

    if (command === "toggle launcher") {
      App.toggle_window("launcher")
      response("ok")
      return
    }
    response("unknown request")
  },

  main() {
    App.apply_css(`${cfg}/ags/themes/osd.css`)
    AppLauncher()
    OSD()
    watchLauncherToggle()
  },

  css: `${cfg}/ags/themes/launcher.css`,
})
