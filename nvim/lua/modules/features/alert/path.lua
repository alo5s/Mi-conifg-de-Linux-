local M = {}

--- Devuelve una ruta de archivo compacta con el formato:
--- …/dir1/dir2/file.lua
--- (máximo 2 directorios antes del nombre del archivo)
function M.compact(path)
  if not path or path == "" then
    return ""
  end

  -- Normalizar la ruta
  path = vim.fs.normalize(path)

  -- Separar la ruta en segmentos
  local parts = vim.split(path, "/", { trimempty = true })

  local len = #parts
  if len <= 3 then
    -- La ruta ya es lo suficientemente corta
    return "…/" .. table.concat(parts, "/")
  end

  -- Tomar las últimas 3 partes: dir1/dir2/file
  local tail = {
    parts[len - 2],
    parts[len - 1],
    parts[len],
  }

  return "…/" .. table.concat(tail, "/")
end

return M

