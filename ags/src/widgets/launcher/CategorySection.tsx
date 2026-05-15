import { createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import { CatInfo, AppEntry } from "../../services/apps"

interface CategorySectionProps {
  sectionItems: () => CatInfo[]
  catItems: () => AppEntry[]
  selectedIdx: () => number
  onSelect: (idx: number) => void
  onHover: (idx: number) => void
}

export function CategorySection({ sectionItems, catItems, selectedIdx, onSelect, onHover }: CategorySectionProps) {
  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <For each={sectionItems}>
        {(item, index) => {
          const cat = item as CatInfo
          const itemClass = createComputed(() =>
            "list-item category-" + cat.cssClass +
            (selectedIdx() === index() ? " focused" : "")
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
                <label class="list-item-icon" label={cat.icon} />
                <label class="list-item-title" label={cat.label} hexpand xalign={0} />
              </box>
            </button>
          )
        }}
      </For>

      <For each={catItems}>
        {(item, index) => {
          const app = item as AppEntry
          const itemClass = createComputed(() =>
            "list-item category-" + app.cat.cssClass +
            (selectedIdx() === index() ? " focused" : "")
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
                <image class="list-item-app-icon" iconName={app.iconName} pixelSize={24} />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                  <label
                    class="list-item-title"
                    label={app.name}
                    xalign={0}
                    ellipsize={3}
                    maxWidthChars={50}
                  />
                  <label
                    class="list-item-desc"
                    label={app.description}
                    xalign={0}
                    ellipsize={3}
                    maxWidthChars={50}
                  />
                </box>
              </box>
            </button>
          )
        }}
      </For>
    </box>
  )
}
