import GLib from "gi://GLib?version=2.0"

export interface FileItem {
  name: string
  path: string
  isDirectory: boolean
  icon: string
}

export class FileSearchService {
  private static instance: FileSearchService
  private searchRoot: string
  private maxResults: number

  private constructor(searchRoot: string = GLib.get_home_dir(), maxResults: number = 50) {
    this.searchRoot = searchRoot
    this.maxResults = maxResults
  }

  public static getInstance(): FileSearchService {
    if (!FileSearchService.instance) {
      FileSearchService.instance = new FileSearchService()
    }
    return FileSearchService.instance
  }

  public async search(query: string): Promise<FileItem[]> {
    if (!query.trim()) return []

    try {
      // Usar fd para buscar archivos y directorios
      const searchQuery = query.trim()
      const command = `fd --type f --type d --hidden --exclude '.git' --max-depth 6 '${searchQuery}' '${this.searchRoot}' | head -n ${this.maxResults}`
      
      // En un entorno real, usaríamos una API async de fd o implementaríamos nuestra propia búsqueda
      // Por ahora, simulamos con una búsqueda básica
      return await this.performBasicSearch(searchQuery)
    } catch (error) {
      console.error("Error searching files:", error)
      return []
    }
  }

  private async performBasicSearch(query: string): Promise<FileItem[]> {
    // Implementación básica usando Node.js fs (en un entorno real, esto sería más sofisticado)
    // Por ahora, devolvemos un array vacío como placeholder
    // En una implementación completa, usaríamos fs.readdir recursivamente con filtrado
    return []
  }

  public async openFile(path: string): Promise<void> {
    try {
      // Usar xdg-open para abrir archivos con su aplicación predeterminada
      GLib.spawn_command_line_async(`xdg-open '${path}'`)
    } catch (error) {
      console.error("Error opening file:", error)
    }
  }

  public async openDirectory(path: string): Promise<void> {
    try {
      // Abrir el directorio en el gestor de archivos predeterminado
      GLib.spawn_command_line_async(`xdg-open '${path}'`)
    } catch (error) {
      console.error("Error opening directory:", error)
    }
  }

  public setSearchRoot(root: string): void {
    this.searchRoot = root
  }

  public setMaxResults(max: number): void {
    this.maxResults = max
  }
}

// Exportar instancia singleton
export const fileSearchService = FileSearchService.getInstance()