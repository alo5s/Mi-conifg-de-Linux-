import { createComputed, For } from "ags"
import { Gtk } from "ags/gtk4"
import { AppEntry, CatInfo } from "../../services/apps"
import { CustomGroup, CustomLauncher } from "../../services/custom-launchers"
import { WebAppEntry } from "../../services/webapps"
import { WallpaperInfo } from "../../services/wallpaper"
import { CalcInfo, MainMenuItem, SettingsItem } from "../../services/launcher"
import { FileItem } from "../../services/files"
import { copyToClipboard } from "../../utils/gtk"
import { CategorySection } from "./CategorySection"
import MainMenu from "./MainMenu"
import Wallpaper from "./Wallpaper"
import WebSection from "./WebSection"

interface ResultsProps {
  onScrollRef: (ref: Gtk.ScrolledWindow) => void
  calcItems: () => CalcInfo[]
  mainItems: () => MainMenuItem[]
  sectionItems: () => CatInfo[]
  catItems: () => AppEntry[]
  searchItems: () => AppEntry[]
  webSectionItems: () => (WebAppEntry | { type: "install" })[]
  showWebSection: () => boolean
  customViewItems: () => ({ type: "web-apps" } | CustomGroup)[]
  customLauncherItems: () => CustomLauncher[]
  settingsItems: () => SettingsItem[]
  selectedIdx: () => number
  webInstallShow: () => boolean
  showWallpaperForm: () => boolean
  wallpaperInfo: () => WallpaperInfo | null
  allWallpapersList: () => WallpaperInfo[]
  wallpaperStatus: () => string
  wallpaperUrlState: () => string
  lastDeleted: () => WallpaperInfo | null
  emptyLabel: () => string
  showEmpty: () => boolean
  onSelect: (idx: number) => void
  onHover: (idx: number) => void
  onClose: () => void
  onWebNameEntryRef: (ref: Gtk.Entry) => void
  onWebUrlEntryRef: (ref: Gtk.Entry) => void
  onInstallWeb: () => void
  onRemoveWeb: (app: WebAppEntry) => void
  onLaunchWeb: (app: WebAppEntry) => void
  onWallpaperUrlChange: (url: string) => void
  onApplyWallpaperUrl: () => void
  onApplyWallpaper: (path: string) => void
  onDeleteWallpaper: (path: string) => void
  onRandomWallpaper: () => void
  onUndoDeleteWallpaper: () => void
  onDropWallpaperFile: (path: string) => void
  fileResults: () => FileItem[]
  isFileSearchLoading: () => boolean
}

export default function Results({
  onScrollRef,
  calcItems,
  mainItems,
  sectionItems,
  catItems,
  searchItems,
  webSectionItems,
  showWebSection,
  customViewItems,
  customLauncherItems,
  settingsItems,
  selectedIdx,
  webInstallShow,
  showWallpaperForm,
  wallpaperInfo,
  allWallpapersList,
  wallpaperStatus,
  wallpaperUrlState,
  lastDeleted,
  emptyLabel,
  showEmpty,
  onSelect,
  onHover,
  onClose,
  onWebNameEntryRef,
  onWebUrlEntryRef,
  onInstallWeb,
  onRemoveWeb,
  onLaunchWeb,
  onWallpaperUrlChange,
  onApplyWallpaperUrl,
  onApplyWallpaper,
  onDeleteWallpaper,
  onRandomWallpaper,
  onUndoDeleteWallpaper,
  onDropWallpaperFile,
  fileResults,
  isFileSearchLoading,
}: ResultsProps) {
  return (
    <scrolledwindow
      $={onScrollRef}
      class="results-scroll"
      hexpand
      vexpand
      hscrollbar-policy={Gtk.PolicyType.NEVER}
      vscrollbar-policy={Gtk.PolicyType.AUTOMATIC}
      propagate-natural-height
      max-content-height={420}
    >
      <box class="scroll-container" orientation={Gtk.Orientation.VERTICAL}>
        <For each={calcItems}>
          {(calc) => (
            <button
              class={"list-item focused"}
              onClicked={() => {
                copyToClipboard(calc.result.toString())
                onClose()
              }}
            >
              <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
                <label class="list-item-icon" label="󰃬" />
                <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                  <label class="list-item-title" label={`${calc.expr} = ${calc.result}`} xalign={0} />
                  <label class="list-item-desc" label="Copiar al portapapeles" xalign={0} />
                </box>
              </box>
            </button>
          )}
        </For>

        <MainMenu
          items={mainItems}
          selectedIdx={selectedIdx}
          onSelect={onSelect}
          onHover={onHover}
        />

        <CategorySection
          sectionItems={sectionItems}
          catItems={catItems}
          selectedIdx={selectedIdx}
          onSelect={onSelect}
          onHover={onHover}
        />

        <WebSection
          show={showWebSection}
          items={webSectionItems}
          installRevealed={webInstallShow}
          selectedIdx={selectedIdx}
          onSelect={onSelect}
          onHover={onHover}
          onWebNameEntryRef={onWebNameEntryRef}
          onWebUrlEntryRef={onWebUrlEntryRef}
          onInstall={onInstallWeb}
          onRemove={onRemoveWeb}
          onLaunch={onLaunchWeb}
        />

        <For each={customViewItems}>
          {(item, index) => {
            const isWebApps = "type" in item && item.type === "web-apps"
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
                  <label class="list-item-icon" label={isWebApps ? "󰖟" : group.icon} />
                  <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                    <label class="list-item-title" label={isWebApps ? "Web Apps" : group.title} xalign={0} />
                    <label class="list-item-desc" label={isWebApps ? "Instalar y gestionar aplicaciones web" : group.desc} xalign={0} />
                  </box>
                </box>
              </button>
            )
          }}
        </For>

        <For each={customLauncherItems}>
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

        <For each={settingsItems}>
          {(item, index) => {
            const s = item as SettingsItem
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
                  <label class="list-item-icon" label={s.icon} />
                  <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                    <label class="list-item-title" label={s.title} xalign={0} />
                    <label class="list-item-desc" label={s.desc} xalign={0} />
                  </box>
                </box>
              </button>
            )
          }}
        </For>

        <box visible={showWallpaperForm} vexpand>
          <Wallpaper
            currentWallpaper={wallpaperInfo}
            allWallpapers={allWallpapersList}
            status={wallpaperStatus}
            url={wallpaperUrlState}
            lastDeleted={lastDeleted}
            onUrlChange={onWallpaperUrlChange}
            onApplyUrl={onApplyWallpaperUrl}
            onApply={onApplyWallpaper}
            onDelete={onDeleteWallpaper}
            onRandom={onRandomWallpaper}
            onUndoDelete={onUndoDeleteWallpaper}
            onDropFile={onDropWallpaperFile}
          />
        </box>

        <For each={searchItems}>
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

         {/* Sección de resultados de búsqueda de archivos */}
         <For each={fileResults}>
           {(file, index) => {
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
                   <label class="list-item-icon" label={file.isDirectory ? "󰉋" : "󰈚"} />
                   <box orientation={Gtk.Orientation.VERTICAL} spacing={1} hexpand>
                     <label class="list-item-title" label={file.name} xalign={0} ellipsize={3} maxWidthChars={50} />
                     <label class="list-item-desc" label={file.path} xalign={0} ellipsize={3} maxWidthChars={50} />
                   </box>
                 </box>
               </button>
             )
           }}
         </For>

         {/* Mostrar indicador de carga cuando se está buscando archivos */}
         {isFileSearchLoading() && (
           <label
             label="Buscando archivos..."
             class="empty-state"
             hexpand
             vexpand
             valign={Gtk.Align.CENTER}
           />
         )}

         <label
           label={emptyLabel}
           class="empty-state"
           hexpand
           vexpand
           valign={Gtk.Align.CENTER}
           visible={showEmpty}
         />
      </box>
    </scrolledwindow>
  )
}
