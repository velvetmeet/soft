// =====================================
// VELVETMEET /go REDIRECT
// 302 redirect with dynamic ?s= tracking
// =====================================

// Партнёрский базовый URL — поменяй если сменится оффер
const AFFILIATE_BASE = "https://go.cm-trk6.com/aff_f?h=rA47F6";

// Дефолтная метка если параметра s нет
const DEFAULT_SOURCE = "organic";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Читаем s параметр
  let s = url.searchParams.get("s") || DEFAULT_SOURCE;
  
  // Чистим от опасных символов
  s = s.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  if (!s) s = DEFAULT_SOURCE;
  
  // Собираем финальный URL
  const target = AFFILIATE_BASE + "&aff_sub5=" + encodeURIComponent(s);
  
  // Возвращаем 302
  return Response.redirect(target, 302);
}
