import { For } from "ags"
import { Gtk } from "ags/gtk4"

interface Hint {
  key: string
  desc: string
}

interface FooterProps {
  hints: () => Hint[]
}

export default function Footer({ hints }: FooterProps) {
  return (
    <box class="footer" orientation={Gtk.Orientation.HORIZONTAL} spacing={18} hexpand>
      <For each={hints}>
        {(hint) => (
          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
            <label class="footer-key" label={hint.key} />
            <label class="footer-desc" label={hint.desc} />
          </box>
        )}
      </For>
    </box>
  )
}
