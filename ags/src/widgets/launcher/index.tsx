import { createState, createComputed } from "ags"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import Graphene from "gi://Graphene"
import GLib from "gi://GLib?version=2.0"
import { getAllApps, getUniqueCategories, AppEntry, CatInfo } from "../../services/apps"
import { getInstalledWebApps, installWebApp, uninstallWebApp, WebAppEntry, getBrowser } from "../../services/webapps"
import { CustomGroup, CustomLauncher, getGroups, launchLauncher, getTerminal } from "../../services/custom-launchers"
import { getWallpaper, setWallpaper, getAllWallpapers, applyExisting, deleteWallpaper, getRandomWallpaper, importFile, WallpaperInfo } from "../../services/wallpaper"
import { fileSearchService, FileItem } from "../../services/files"
import { copyToClipboard } from "../../utils/gtk"
import { scrollAdjustmentTo } from "../../utils/animations"
import { matchesSearch } from "../../utils/fuzzy"
import {
  CALC_HINTS,
  CATEGORY_HINTS,
  MAIN_HINTS,
  MAIN_MENU,
  MainMenuItem,
  SEARCH_HINTS,
  SECTION_HINTS,
  SETTINGS_ITEMS,
  SettingsItem,
  View,
  evaluateCalc,
  CalcInfo,
} from "../../services/launcher"
import Header from "./Header"
import Results from "./Results"
import Footer from "./Footer"


import App from "ags/gtk4/app"


const RESULT_LIMIT = 25
const SEARCH_DEBOUNCE_MS = 100
const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

export default function AppLauncher() {
  const allApps = getAllApps()

  const [navStack, setNavStack] = createState<View[]>([{ type: "main" }])
  const [searchText, setSearchText] = createState("")
  const [selectedIdx, setSelectedIdx] = createState(-1)
  const [calcResult, setCalcResult] = createState<CalcInfo | null>(null)
  const [webInstallShow, setWebInstallShow] = createState(false)
  const [webApps, setWebApps] = createState<WebAppEntry[]>(getInstalledWebApps())
  const [wallpaperUrlState, setWallpaperUrlState] = createState("")
  const [wallpaperStatus, setWallpaperStatus] = createState("")
  const [wallpaperVersion, setWallpaperVersion] = createState(0)
  const [lastDeleted, setLastDeleted] = createState<WallpaperInfo | null>(null)
  const [fileResults, setFileResults] = createState<FileItem[]>([])
  const [isFileSearchLoading, setIsFileSearchLoading] = createState(false)
  let undoTimeoutId = 0

  function setStatus(msg: string) {
    setWallpaperStatus(msg)
    if (msg && !msg.includes("...")) {
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 3000, () => {
        if (wallpaperStatus.peek() === msg) setWallpaperStatus("")
        return GLib.SOURCE_REMOVE
      })
    }
  }

  let win: Astal.Window
  let webNameEntry: Gtk.Entry
  let webUrlEntry: Gtk.Entry
  let searchEntry: Gtk.Entry
  let contentBox: Gtk.Box
  let scrollWin: Gtk.ScrolledWindow
  let searchTimer: number | null = null

  const currentView = createComputed(() => navStack()[navStack().length - 1])
  const showBackBtn = createComputed(() => navStack().length > 1 || searchText() !== "")

  const isViewType = createComputed(() => currentView().type)
  const isSearching = createComputed(() => searchText() !== "")
  const hasCalc = createComputed(() => calcResult() !== null)

  const mainItems = createComputed((): MainMenuItem[] =>
    isViewType() === "main" && !isSearching() ? MAIN_MENU : []
  )

  const sectionItems = createComputed((): CatInfo[] => {
    const view = currentView()
    return view.type === "section" && !isSearching()
      ? (view.id === "apps" ? getUniqueCategories(allApps) : [])
      : []
  })

  const catItems = createComputed((): AppEntry[] => {
    const view = currentView()
    if (view.type !== "category" || isSearching()) return []
    const webPaths = webAppDesktopPaths()
    return allApps.filter(a =>
      a.cat.label === view.label && !webPaths.has(a.info.get_filename())
    )
  })

  const searchItems = createComputed((): AppEntry[] => {
    const text = searchText()
    if (!text || hasCalc()) return []
    const q = text.toLowerCase()
    const webPaths = webAppDesktopPaths()
    return allApps.filter(a =>
      (matchesSearch(a.name, q) || matchesSearch(a.description, q)) &&
      !webPaths.has(a.info.get_filename())
    ).slice(0, RESULT_LIMIT)
  })

  const webSectionItems = createComputed((): (WebAppEntry | { type: "install" })[] => {
    if (isViewType() !== "web" || isSearching()) return []
    const items: (WebAppEntry | { type: "install" })[] = [
      { type: "install" },
    ]
    items.push(...webApps())
    return items
  })
  const showWebSection = createComputed(() => isViewType() === "web")
  const webAppDesktopPaths = createComputed(() => new Set(webApps().map(a => a.desktopPath)))

  const customGroups = createComputed(() => getGroups())

  const customViewItems = createComputed((): ({ type: "web-apps" } | CustomGroup)[] => {
    if (isViewType() !== "custom" || isSearching()) return []
    return [{ type: "web-apps" }, ...customGroups()]
  })

  const customLauncherItems = createComputed((): CustomLauncher[] => {
    const view = currentView()
    if (view.type !== "custom-group" || isSearching()) return []
    return view.group.launchers
  })

  const settingsItems = createComputed((): SettingsItem[] => {
    if (isViewType() !== "settings" || isSearching()) return []
    return SETTINGS_ITEMS
  })

  const wallpaperInfo = createComputed((): WallpaperInfo | null => {
    if (isViewType() !== "wallpaper") return null
    wallpaperVersion()
    return getWallpaper()
  })

  const allWallpapersList = createComputed((): WallpaperInfo[] => {
    if (isViewType() !== "wallpaper") return []
    wallpaperVersion()
    return getAllWallpapers()
  })

  const showWallpaperForm = createComputed(() => isViewType() === "wallpaper")

  const calcItems = createComputed((): CalcInfo[] => {
    const c = calcResult()
    return c ? [c] : []
  })

const sectionLabel = createComputed(() => {
  if (hasCalc()) return "CALCULAR"
  if (isSearching()) return `RESULTADOS (${currentItemsLength()})`
  switch (isViewType()) {
    case "main": return "APLICACIONES"
    case "section": return currentView().title.toUpperCase()
    case "category": {
      const count = currentItemsLength()
      return `${currentView().label} — ${count} app${count !== 1 ? "s" : ""}`
    }
    case "files": return `ARCHIVOS (${fileResults().length})`
    case "web": return "WEB APPS"
    case "custom": return "HERRAMIENTAS"
    case "custom-group": return currentView().group.title.toUpperCase()
    case "settings": return "CONFIGURACIÓN"
    case "wallpaper": return "WALLPAPER"
  }
})

const currentItemsLength = createComputed(() =>
  mainItems().length + sectionItems().length + catItems().length + searchItems().length + webSectionItems().length + customViewItems().length + customLauncherItems().length + settingsItems().length + fileResults().length
)

  const footerHints = createComputed(() => {
    if (hasCalc()) return CALC_HINTS
    if (isSearching()) return SEARCH_HINTS
    switch (isViewType()) {
      case "main": return MAIN_HINTS
      case "section": return SECTION_HINTS
      case "category": return CATEGORY_HINTS
      case "web": return SECTION_HINTS
      case "custom": return MAIN_HINTS
      case "custom-group": return CATEGORY_HINTS
      case "settings": return CATEGORY_HINTS
      case "wallpaper": return CALC_HINTS
    }
  })

  const showEmpty = createComputed(() =>
    !hasCalc() && isViewType() !== "main" && isViewType() !== "wallpaper" && currentItemsLength() === 0
  )

  const emptyLabel = createComputed(() =>
    isSearching() ? "Sin resultados" : ""
  )

  function updateWallpaperClass() {
    if (!contentBox) return
    if (isViewType() === "wallpaper") {
      contentBox.add_css_class("wallpaper-active")
    } else {
      contentBox.remove_css_class("wallpaper-active")
    }
  }

  function navigateTo(view: View) {
    setNavStack([...navStack.peek(), view])
    setSelectedIdx(-1)
    setSearchText("")
    searchEntry?.set_text("")
    if (scrollWin?.vadjustment) scrollWin.vadjustment.set_value(0)
    updateWallpaperClass()
  }

  function goBack() {
    const stack = navStack.peek()
    if (stack.length > 1) {
      setNavStack(stack.slice(0, -1))
      setSelectedIdx(-1)
      setSearchText("")
      searchEntry?.set_text("")
      if (scrollWin?.vadjustment) scrollWin.vadjustment.set_value(0)
    } else {
      win.visible = false
    }
    updateWallpaperClass()
  }

  function handleSelect(idx: number) {
    if (searchTimer !== null) {
      GLib.source_remove(searchTimer)
      searchTimer = null
      setSearchText(searchEntry?.text ?? "")
    }

    if (hasCalc()) {
      copyToClipboard(calcResult.peek()!.result.toString())
      win.visible = false
      return
    }

    const view = currentView.peek()
    const isSearch = searchText.peek() !== ""

    if (isSearch) {
      const items = searchItems.peek()
      if (idx < 0 || idx >= items.length) return
      const app = items[idx]
      win.visible = false
      app.info.launch([], null)
      return
    }

     if (view.type === "main") {
       if (idx < 0 || idx >= MAIN_MENU.length) return
       const m = MAIN_MENU[idx]
       if (m.id === "apps") {
         navigateTo({ type: "section", id: "apps", title: "Apps" })
       } else if (m.id === "files") {
         navigateTo({ type: "files", query: "" })
       } else if (m.id === "navegar") {
         win.visible = false
         GLib.spawn_command_line_async("brave-origin-beta")
       } else if (m.id === "programa") {
         win.visible = false
         const term = getTerminal()
         GLib.spawn_command_line_async(`${term} -e nvim`)
       } else if (m.id === "tools") {
         navigateTo({ type: "custom" })
       } else if (m.id === "settings") {
         navigateTo({ type: "settings" })
       } else {
         win.visible = false
       }
     } else if (view.type === "section") {
      const items = sectionItems.peek()
      if (idx < 0 || idx >= items.length) return
      const cat = items[idx]
      navigateTo({ type: "category", sectionId: view.id, label: cat.label, cat })
    } else if (view.type === "category") {
      const items = catItems.peek()
      if (idx < 0 || idx >= items.length) return
      const app = items[idx]
      win.visible = false
      app.info.launch([], null)
    } else if (view.type === "web") {
      const items = webSectionItems.peek()
      if (idx < 0 || idx >= items.length) return
      const item = items[idx]
      if ("type" in item && !("desktopPath" in item)) {
        if (item.type === "install") {
          setWebInstallShow(!webInstallShow.peek())
        }
      } else {
        const webApp = item as WebAppEntry
        win.visible = false
        const browserApp = getBrowser()
        GLib.spawn_command_line_async(`${browserApp} --app='${webApp.url}' --class=WebApp.${webApp.slug}`)
      }
    } else if (view.type === "custom") {
      const items = customViewItems.peek()
      if (idx < 0 || idx >= items.length) return
      const item = items[idx]
      if ("type" in item && item.type === "web-apps") {
        navigateTo({ type: "web" })
      } else {
        navigateTo({ type: "custom-group", group: item as CustomGroup })
      }
    } else if (view.type === "custom-group") {
      const items = customLauncherItems.peek()
      if (idx < 0 || idx >= items.length) return
      win.visible = false
      launchLauncher(items[idx])
    } else if (view.type === "settings") {
      const items = settingsItems.peek()
      if (idx < 0 || idx >= items.length) return
      const item = items[idx]
      if (item.id === "wallpaper") {
        navigateTo({ type: "wallpaper" })
      }
    } else if (view.type === "wallpaper") {
       const url = wallpaperUrlState.peek().trim()
       if (!url) return
       setStatus("Descargando...")
       GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
         const result = setWallpaper(url)
         setStatus(result)
         setWallpaperVersion(v => v + 1)
         return GLib.SOURCE_REMOVE
       })
     } else if (view.type === "files") {
       const items = fileResults()
       if (idx < 0 || idx >= items.length) return
       const file = items[idx]
       if (file.isDirectory) {
         fileSearchService.openDirectory(file.path)
       } else {
         fileSearchService.openFile(file.path)
       }
       win.visible = false
     }
   }

  function scrollToSelected() {
    if (!scrollWin?.vadjustment) return
    const idx = selectedIdx.peek()
    const container = scrollWin.child
    if (!container) return

    let child = container.get_first_child()
    let itemH = 54
    while (child) {
      if (child.visible) {
        if (child.has_css_class("list-item")) {
          const h = child.allocation?.height
          if (h && h > 0) itemH = h
          break
        }
      }
      child = child.get_next_sibling()
    }

    const adj = scrollWin.vadjustment
    const target = Math.max(0, idx * itemH - adj.get_page_size() / 2 + itemH / 2)
    scrollAdjustmentTo(adj, target)
  }

function navigate(dir: 1 | -1) {
  const total =
    mainItems.peek().length + sectionItems.peek().length +
    catItems.peek().length + searchItems.peek().length + webSectionItems.peek().length +
    customViewItems.peek().length + customLauncherItems.peek().length + settingsItems.peek().length +
    fileResults().length
  if (total === 0) return

  let newIdx = selectedIdx.peek() + dir
  if (newIdx < 0) newIdx = total - 1
  if (newIdx >= total) newIdx = 0
  setSelectedIdx(newIdx)

  scrollToSelected()
}

async function search(text: string) {
  setSelectedIdx(-1)
  
  const currentViewType = isViewType.peek()
  
  if (currentViewType === "files") {
    setIsFileSearchLoading(true)
    setSearchText(text)
    try {
      const results = await fileSearchService.search(text)
      setFileResults(results)
    } catch (error) {
      console.error("Error searching files:", error)
      setFileResults([])
    } finally {
      setIsFileSearchLoading(false)
    }
    setCalcResult(text ? evaluateCalc(text) : null)
  } else {
    setCalcResult(text ? evaluateCalc(text) : null)
    if (searchTimer !== null) {
      GLib.source_remove(searchTimer)
    }
    searchTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, SEARCH_DEBOUNCE_MS, () => {
      setSearchText(text)
      searchTimer = null
      return GLib.SOURCE_REMOVE
    })
  }
  
  if (scrollWin?.vadjustment) scrollWin.vadjustment.set_value(0)
}

  function setupWindow(ref: Astal.Window) {
    win = ref
    ref.keymode = Astal.Keymode.EXCLUSIVE

    const keyCtrl = new Gtk.EventControllerKey()
    keyCtrl.propagation_phase = Gtk.PropagationPhase.CAPTURE
    keyCtrl.connect("key-pressed", (_ctrl, keyval, _keycode, state) => {
      if (keyval !== Gdk.KEY_Escape && isViewType.peek() === "web" && webInstallShow.peek()) {
        return Gdk.EVENT_PROPAGATE
      }
      if (keyval === Gdk.KEY_Escape && webInstallShow.peek()) {
        setWebInstallShow(false)
        searchEntry?.grab_focus()
        return Gdk.EVENT_STOP
      }
      if (keyval === Gdk.KEY_Escape) {
        if (searchText.peek() !== "") {
          setSearchText("")
          searchEntry?.set_text("")
          return Gdk.EVENT_STOP
        }
        if (navStack.peek().length > 1) {
          goBack()
          return Gdk.EVENT_STOP
        }
        win.visible = false
        return Gdk.EVENT_STOP
      }
      if (keyval === Gdk.KEY_Left) {
        if (navStack.peek().length > 1) {
          goBack()
          return Gdk.EVENT_STOP
        }
        return Gdk.EVENT_PROPAGATE
      }
      if (keyval === Gdk.KEY_Right) {
        handleSelect(selectedIdx.peek())
        return Gdk.EVENT_STOP
      }
      if (keyval === Gdk.KEY_Down || keyval === Gdk.KEY_Tab) {
        navigate(1)
        return Gdk.EVENT_STOP
      }
      if (keyval === Gdk.KEY_Up) {
        if (searchEntry?.text === "" && selectedIdx.peek() <= 0)
          return Gdk.EVENT_PROPAGATE
        navigate(-1)
        return Gdk.EVENT_STOP
      }
      if (keyval === Gdk.KEY_Delete || keyval === Gdk.KEY_KP_Delete) {
        if (isViewType.peek() === "web") {
          const items = webSectionItems.peek()
          const idx = selectedIdx.peek()
          if (idx >= 0 && idx < items.length && "desktopPath" in items[idx]) {
            uninstallWebApp(items[idx] as WebAppEntry)
            setWebApps(getInstalledWebApps(true))
            setSelectedIdx(-1)
            return Gdk.EVENT_STOP
          }
        }
        return Gdk.EVENT_PROPAGATE
      }
      if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
        handleSelect(selectedIdx.peek())
        return Gdk.EVENT_STOP
      }
      if (keyval === Gdk.KEY_BackSpace) {
        const text = searchEntry?.text ?? ""
        if (text.length > 0) {
          const newText = text.slice(0, -1)
          searchEntry?.set_text(newText)
          search(newText)
        }
        return Gdk.EVENT_STOP
      }
      if (!(state & Gdk.ModifierType.CONTROL_MASK) && !(state & Gdk.ModifierType.META_MASK)) {
        const unicode = Gdk.keyval_to_unicode(keyval)
        if (unicode > 0) {
          const char = String.fromCharCode(unicode)
          const text = (searchEntry?.text ?? "") + char
          searchEntry?.set_text(text)
          search(text)
          return Gdk.EVENT_STOP
        }
      }
      return Gdk.EVENT_PROPAGATE
    })
    win.add_controller(keyCtrl)

    const clickCtrl = new Gtk.GestureClick()
    clickCtrl.connect("pressed", (_gesture, _n_press, x, y) => {
      const [, rect] = contentBox.compute_bounds(win)
      const pos = new Graphene.Point({ x, y })
      if (!rect.contains_point(pos)) {
        win.visible = false
      }
    })
    win.add_controller(clickCtrl)

    win.connect("map", () => {
      if (searchTimer !== null) {
        GLib.source_remove(searchTimer)
        searchTimer = null
      }
      setNavStack([{ type: "main" }])
      setSelectedIdx(-1)
      setSearchText("")
      searchEntry?.set_text("")
      win.set_focus(searchEntry)
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
        win?.present()
        win.set_focus(searchEntry)
        return GLib.SOURCE_REMOVE
      })
    })
  }

  return (
    <window
      $={setupWindow}
      application={App}
      name="launcher"
      visible={false}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
    >
      <box
        $={(ref) => (contentBox = ref)}
        name="launcher-content"
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}
      >
        <Header
          showBackBtn={showBackBtn}
          onGoBack={goBack}
          onSearchEntryRef={(ref) => (searchEntry = ref)}
          onSearch={search}
        />

        <box class="search-separator" hexpand />
        <label class="section-header" label={sectionLabel} hexpand xalign={0} />

<Results
  onScrollRef={(ref) => (scrollWin = ref)}
  calcItems={calcItems}
  mainItems={mainItems}
  sectionItems={sectionItems}
  catItems={catItems}
  searchItems={searchItems}
  webSectionItems={webSectionItems}
  showWebSection={showWebSection}
  customViewItems={customViewItems}
  customLauncherItems={customLauncherItems}
  settingsItems={settingsItems}
  selectedIdx={selectedIdx}
  webInstallShow={webInstallShow}
  showWallpaperForm={showWallpaperForm}
  wallpaperInfo={wallpaperInfo}
  allWallpapersList={allWallpapersList}
  wallpaperStatus={wallpaperStatus}
  wallpaperUrlState={wallpaperUrlState}
  lastDeleted={lastDeleted}
  emptyLabel={emptyLabel}
  showEmpty={showEmpty}
  fileResults={fileResults}
  isFileSearchLoading={isFileSearchLoading}
  onSelect={(idx) => handleSelect(idx)}
  onHover={(idx) => setSelectedIdx(idx)}
  onClose={() => (win.visible = false)}
  onWebNameEntryRef={(ref) => (webNameEntry = ref)}
  onWebUrlEntryRef={(ref) => (webUrlEntry = ref)}
  onInstallWeb={() => {
    const name = webNameEntry?.text ?? ""
    const url = webUrlEntry?.text ?? ""
    if (name && url) {
      installWebApp(name, url)
      setWebInstallShow(false)
      webNameEntry.text = ""
      webUrlEntry.text = ""
      setWebApps(getInstalledWebApps(true))
      setSelectedIdx(-1)
    }
  }}
  onRemoveWeb={(app) => {
    uninstallWebApp(app)
    setWebApps(getInstalledWebApps(true))
    setSelectedIdx(-1)
  }}
  onLaunchWeb={(webApp) => {
    win.visible = false
    const browserApp = getBrowser()
    GLib.spawn_command_line_async(`${browserApp} --app='${webApp.url}' --class=WebApp.${webApp.slug}`)
  }}
  onWallpaperUrlChange={setWallpaperUrlState}
  onApplyWallpaperUrl={() => {
    const u = wallpaperUrlState.peek().trim()
    if (!u) return
    setStatus("Descargando...")
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
      const result = setWallpaper(u)
      setStatus(result)
      setWallpaperVersion(v => v + 1)
      return GLib.SOURCE_REMOVE
    })
  }}
  onApplyWallpaper={(path) => {
    const ok = applyExisting(path)
    setStatus(ok ? "Wallpaper aplicado" : "Error al aplicar")
    setWallpaperVersion(v => v + 1)
  }}
  onDeleteWallpaper={(path) => {
    const info: WallpaperInfo = {
      url: path.split("/").pop() || "",
      path,
      type: "image",
      timestamp: Date.now(),
    }
    setLastDeleted(info)
    setStatus("Wallpaper eliminado. ↩ Deshacer")
    if (undoTimeoutId > 0) GLib.source_remove(undoTimeoutId)
    undoTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
      setLastDeleted(null)
      undoTimeoutId = 0
      return GLib.SOURCE_REMOVE
    })
    deleteWallpaper(path)
    setWallpaperVersion(v => v + 1)
  }}
  onRandomWallpaper={() => {
    const r = getRandomWallpaper()
    if (r) {
      applyExisting(r.path)
      setStatus("Wallpaper aleatorio aplicado")
      setWallpaperVersion(v => v + 1)
    } else {
      setStatus("No hay wallpapers disponibles")
    }
  }}
  onUndoDeleteWallpaper={() => {
    const ld = lastDeleted.peek()
    if (!ld) return
    if (undoTimeoutId > 0) {
      GLib.source_remove(undoTimeoutId)
      undoTimeoutId = 0
    }
    importFile(ld.path)
    setStatus("Wallpaper restaurado")
    setLastDeleted(null)
    setWallpaperVersion(v => v + 1)
  }}
  onDropWallpaperFile={(path: string) => {
    const result = importFile(path)
    setStatus(result)
    setWallpaperVersion(v => v + 1)
  }}
/>

        <Footer hints={footerHints} />
      </box>
    </window>
  )
}
