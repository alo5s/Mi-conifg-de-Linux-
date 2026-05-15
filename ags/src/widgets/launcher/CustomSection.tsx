import { createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import { CustomGroup, CustomLauncher } from "../../services/custom-launchers"

interface CustomSectionProps {
  groupItems: () => CustomGroup[]
  launcherItems: () => CustomLauncher[]
  selectedIdx: () => number
  onSelect: (idx: number) => void
  onHover: (idx: number) => void
}

export default function CustomSection({ groupItems, launcherItems, selectedIdx, onSelect, onHover }: CustomSectionProps) {
  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <For each={groupItems}>
        {(item, index) => {
          const group = item as CustomGroup
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
                <label class="list-item-icon" label={group.icon} />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                  <label class="list-item-title" label={group.title} xalign={0} />
                  <label class="list-item-desc" label={group.desc} xalign={0} />
                </box>
              </box>
            </button>
          )
        }}
      </For>

      <For each={launcherItems}>
        {(item, index) => {
          const launcher = item as CustomLauncher
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
                <label class="list-item-icon" label={launcher.icon || "󰚀"} />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                  <label class="list-item-title" label={launcher.name} xalign={0} />
                  <label class="list-item-desc" label={launcher.desc} xalign={0} />
                </box>
              </box>
            </button>
          )
        }}
      </For>
    </box>
  )
}
