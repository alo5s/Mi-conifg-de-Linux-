import { createComputed, createState, For } from "ags"
import Gio from "gi://Gio?version=2.0"
import Gdk from "gi://Gdk?version=4.0"
import { Gtk } from "ags/gtk4"
import { WallpaperInfo } from "../../services/wallpaper"

interface WallpaperProps {
  currentWallpaper: () => WallpaperInfo | null
  allWallpapers: () => WallpaperInfo[]
  status: () => string
  url: () => string
  lastDeleted: () => WallpaperInfo | null
  onUrlChange: (url: string) => void
  onApplyUrl: () => void
  onApply: (path: string) => void
  onDelete: (path: string) => void
  onRandom: () => void
  onUndoDelete: () => void
  onDropFile: (path: string) => void
}

export default function Wallpaper({
  currentWallpaper, allWallpapers, status, url, lastDeleted,
  onUrlChange, onApplyUrl, onApply, onDelete,
  onRandom, onUndoDelete, onDropFile,
}: WallpaperProps) {
  const [popupPath, setPopupPath] = createState<string | null>(null)

  const showPopup = createComputed(() => popupPath() !== null)
  const showGrid = createComputed(() => !showPopup())
  const popupName = createComputed(() => {
    const p = popupPath()
    return p ? p.split("/").pop() || p : ""
  })

  const isEmpty = createComputed(() => allWallpapers().length === 0)

  const wallpaperRows = createComputed(() => {
    const wps = allWallpapers()
    const cols = 3
    const rows: WallpaperInfo[][] = []
    wps.forEach((wp, i) => {
      const ri = Math.floor(i / cols)
      if (!rows[ri]) rows[ri] = []
      rows[ri].push(wp)
    })
    return rows
  })

  function setupCloseArea(self: Gtk.Widget) {
    const gesture = new Gtk.GestureClick()
    gesture.onPressed = () => setPopupPath(null)
    self.add_controller(gesture)
  }

  function setupDropTarget(self: Gtk.Widget) {
    const formats = Gdk.ContentFormats.new_for_gtype(Gio.File.$gtype)
    const drop = new Gtk.DropTarget(formats)
    drop.set_actions(Gdk.DragAction.COPY)
    drop.onDrop = (d: Gdk.Drop, x: number, y: number) => {
      d.read_value_async(Gio.File.$gtype, 0, null, (src, res) => {
        try {
          const v = src!.read_value_finish(res)
          if (v && v.deep_unpack) {
            const fs = v.deep_unpack()
            if (fs && fs.length > 0) {
              const p = fs[0].get_path()
              if (p) onDropFile(p)
            }
          }
        } catch (e) { void 0; }
      })
      return true
    }
    self.add_controller(drop)
  }

  const popupFile = createComputed(() => {
    const p = popupPath()
    return p ? Gio.File.new_for_path(p) : null
  })

  const hasUndo = createComputed(() => lastDeleted() !== null)

  function closePopup() { setPopupPath(null) }
  function applyFromPopup() {
    const p = popupPath.peek()
    if (p) { onApply(p); closePopup() }
  }
  function deleteFromPopup() {
    const p = popupPath.peek()
    if (p) { closePopup(); onDelete(p) }
  }
  function randomFromPopup() {
    closePopup()
    onRandom()
  }

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL} spacing={0} hexpand vexpand
      $={setupDropTarget}
    >
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6} hexpand class="wallpaper-download-box">
        <entry
          placeholderText="URL de imagen o video"
          hexpand
          text={url}
          onNotifyText={({ text }) => onUrlChange(text || "")}
        />
        <button class="web-install-btn" onClicked={onApplyUrl}>
          <label label="✓ Descargar" />
        </button>
      </box>

      <label label={status} hexpand xalign={0} visible={status} class="wallpaper-download-status" />

      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6} class="wallpaper-toolbar" hexpand>
        <button class="wallpaper-action-btn" onClicked={onRandom}>
          <label label="🎲 Random" />
        </button>
        <button class="wallpaper-undo-btn" visible={hasUndo} onClicked={onUndoDelete}>
          <label label="↩ Deshacer" />
        </button>
        <label hexpand />
      </box>

      <box class="search-separator" hexpand />

      <box visible={showGrid} orientation={Gtk.Orientation.VERTICAL} spacing={0} hexpand vexpand>
        <scrolledwindow hexpand vexpand>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
            <For each={wallpaperRows}>
              {(row, rowIdx) => {
                return (
                  <box orientation={Gtk.Orientation.HORIZONTAL} spacing={10} homogeneous hexpand class="wallpaper-grid-row">
                    <For each={() => wallpaperRows()[rowIdx()] || []}>
                      {(item) => {
                        const w = item as WallpaperInfo
                        const isCurrent = currentWallpaper()?.path === w.path
                        const thumbPath = w.thumbPath || w.path
                        const thumbFile = Gio.File.new_for_path(thumbPath)
                        return (
                          <button
                            class={"wallpaper-grid-btn" + (isCurrent ? " wallpaper-grid-active" : "")}
                            onClicked={() => setPopupPath(w.path)}
                          >
                            <picture file={thumbFile} contentFit={Gtk.ContentFit.COVER} class="wallpaper-grid-pic" />
                          </button>
                        )
                      }}
                    </For>
                  </box>
                )
              }}
            </For>
            <revealer revealChild={isEmpty} transitionType={Gtk.RevealerTransitionType.CROSSFADE}>
              <label class="wallpaper-empty" label="No hay wallpapers todavía. Descarga uno o arrastra un archivo aquí." hexpand xalign={0.5} />
            </revealer>
          </box>
        </scrolledwindow>
      </box>

      <box visible={showPopup} hexpand vexpand class="wallpaper-popup-backdrop">
        <box hexpand vexpand class="wallpaper-popup-close-area" $={setupCloseArea}>
          <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} class="wallpaper-popup-box">
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} class="wallpaper-popup-header">
                <label label={popupName} hexpand xalign={0} class="wallpaper-popup-title" />
                <button class="wallpaper-popup-close-btn" onClicked={closePopup}>
                  <label label="✕" />
                </button>
              </box>
              <picture file={popupFile} contentFit={Gtk.ContentFit.CONTAIN} class="wallpaper-popup-pic" />
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} homogeneous class="wallpaper-popup-footer">
                <button class="wallpaper-popup-btn wallpaper-popup-btn-primary" onClicked={applyFromPopup}>
                  <label label="Aplicar" />
                </button>
                <button class="wallpaper-popup-btn" onClicked={randomFromPopup}>
                  <label label="🎲 Random" />
                </button>
                <button class="wallpaper-popup-btn wallpaper-popup-btn-danger" onClicked={deleteFromPopup}>
                  <label label="Eliminar" />
                </button>
              </box>
            </box>
          </box>
        </box>
      </box>
    </box>
  )
}
