-- lua/modules/features/alert/content.lua
local M = {}

-- Tipos de alerta y sus configuraciones visuales
M.types = {
  file_not_saved = { icon = "", title = "Archivo modificado", hl = "AlertBorderWarning" },
  file_saved     = { icon = "", title = "Archivo guardado",    hl = "AlertSuccess" },
  warning        = { icon = "", title = "Advertencia",         hl = "AlertError" },
}

-- Generadores de mensajes según tipo de alerta
M.messages = {
  file_not_saved = function(filename, filepath)
    return { filepath }
  end,
  file_saved = function(filename)
    return { filename }
  end,
  warning = function(filename)
    return { filename }
  end,
}

-- Función principal de renderizado de alertas
function M.render(alert_type, filename, filepath)
  local t = M.types[alert_type]
  if not t then return { "Tipo de alerta desconocido" }, nil end

  local body = M.messages[alert_type]
  local lines = body and body(filename, filepath) or {}

  -- Construir línea principal con icono y título
  table.insert(lines, 1, string.format("%s %s", t.icon, t.title))

  return lines, t.hl
end

return M

