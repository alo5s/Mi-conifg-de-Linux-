import Gdk from "gi://Gdk?version=4.0"

export function copyToClipboard(text: string) {
  const display = Gdk.Display.get_default()
  if (display) display.get_clipboard().set_text(text)
}
