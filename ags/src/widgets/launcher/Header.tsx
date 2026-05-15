import { Gtk } from "ags/gtk4"

interface HeaderProps {
  showBackBtn: () => boolean
  onGoBack: () => void
  onSearchEntryRef: (ref: Gtk.Entry) => void
  onSearch: (text: string) => void
  placeholderText?: string
}

export default function Header({ showBackBtn, onGoBack, onSearchEntryRef, onSearch, placeholderText }: HeaderProps) {
  return (
    <box class="search-container" orientation={Gtk.Orientation.HORIZONTAL} halign={Gtk.Align.FILL} hexpand>
      <revealer revealChild={showBackBtn} transitionType={Gtk.RevealerTransitionType.CROSSFADE}>
        <button class="back-button" onClicked={onGoBack}>
          <label label="←" />
        </button>
      </revealer>
      <box hexpand halign={Gtk.Align.FILL} orientation={Gtk.Orientation.HORIZONTAL}>
        <label class="search-icon" label="󰍉" valign={Gtk.Align.CENTER} />
        <entry
          $={(ref) => onSearchEntryRef(ref)}
          class="search-entry"
          hexpand
          halign={Gtk.Align.FILL}
          placeholderText={placeholderText || "Buscar apps, archivos, calcular..."}
          onNotifyText={({ text }) => onSearch(text)}
        />
      </box>
    </box>
  )
}
