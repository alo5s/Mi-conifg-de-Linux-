import { createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import { WebAppEntry } from "../../services/webapps"

interface WebSectionProps {
  show: () => boolean
  items: () => (WebAppEntry | { type: "install" })[]
  installRevealed: () => boolean
  selectedIdx: () => number
  onSelect: (idx: number) => void
  onHover: (idx: number) => void
  onWebNameEntryRef: (ref: Gtk.Entry) => void
  onWebUrlEntryRef: (ref: Gtk.Entry) => void
  onInstall: () => void
  onRemove: (app: WebAppEntry) => void
  onLaunch: (app: WebAppEntry) => void
}

export default function WebSection({
  show, items, installRevealed, selectedIdx,
  onSelect, onHover,
  onWebNameEntryRef, onWebUrlEntryRef,
  onInstall, onRemove, onLaunch,
}: WebSectionProps) {
  return (
    <box visible={show} orientation={Gtk.Orientation.VERTICAL}>
      <revealer revealChild={installRevealed} transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={6} class="web-install-form" hexpand>
          <entry
            $={(ref) => onWebNameEntryRef(ref)}
            placeholderText="Nombre de la Web App"
            hexpand
          />
          <entry
            $={(ref) => onWebUrlEntryRef(ref)}
            placeholderText="URL (https://ejemplo.com)"
            hexpand
          />
          <button
            class="web-install-btn"
            onClicked={onInstall}
            hexpand
          >
            <label label="✓ Instalar" />
          </button>
        </box>
      </revealer>

      <For each={items}>
        {(item, index) => {
          if (!("desktopPath" in item)) {
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
                  <label class="list-item-icon" label="󰑐" />
                  <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                    <label class="list-item-title" label="Instalar Web App" xalign={0} />
                    <label class="list-item-desc" label="Añadir una aplicación web" xalign={0} />
                  </box>
                </box>
              </button>
            )
          }

          const webApp = item as WebAppEntry
          const itemClass = createComputed(() =>
            "list-item" + (selectedIdx() === index() ? " focused" : "")
          )
          return (
            <box class={itemClass}
              $={(row) => {
                const motion = new Gtk.EventControllerMotion()
                motion.connect("enter", () => onHover(index()))
                row.add_controller(motion)
              }}
            >
              <box hexpand orientation={Gtk.Orientation.HORIZONTAL} spacing={12}
                $={(content) => {
                  const click = new Gtk.GestureClick()
                  click.connect("pressed", () => onLaunch(webApp))
                  content.add_controller(click)
                }}
              >
                <image class="list-item-app-icon" file={webApp.icon} pixelSize={24} />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                  <label class="list-item-title" label={webApp.name} xalign={0} />
                  <label class="list-item-desc" label={webApp.url} xalign={0} ellipsize={3} maxWidthChars={50} />
                </box>
              </box>
              <label class="web-remove-btn" label="✕"
                $={(label) => {
                  const click = new Gtk.GestureClick()
                  click.connect("pressed", (self) => {
                    try {
                      const seq = self.get_last_updated_sequence()
                      if (seq) self.set_sequence_state(seq, Gtk.EventSequenceState.CLAIMED)
                    } catch {}
                    onRemove(webApp)
                  })
                  label.add_controller(click)
                }}
              />
            </box>
          )
        }}
      </For>
    </box>
  )
}
