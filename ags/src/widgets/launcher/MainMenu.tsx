import { createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"

interface MainMenuItem {
  id: string
  title: string
  icon: string
  desc: string
}

interface MainMenuProps {
  items: () => MainMenuItem[]
  selectedIdx: () => number
  onSelect: (idx: number) => void
  onHover: (idx: number) => void
}

export default function MainMenu({ items, selectedIdx, onSelect, onHover }: MainMenuProps) {
  return (
    <For each={items}>
      {(item, index) => {
        const m = item as MainMenuItem
        const itemClass = createComputed(() =>
          "list-item" + (selectedIdx() === index() ? " focused" : "")
        )
        return (
          <button
            class={itemClass}
            onClicked={() => onSelect(index())}
            $={(btn) => {
              const motion = new Gtk.EventControllerMotion()
              motion.connect("enter", () => onHover(index()))
              btn.add_controller(motion)
            }}
          >
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
              <label class="list-item-icon" label={m.icon} />
              <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                <label class="list-item-title" label={m.title} xalign={0} />
                <label class="list-item-desc" label={m.desc} xalign={0} />
              </box>
            </box>
          </button>
        )
      }}
    </For>
  )
}
