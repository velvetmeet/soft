// =====================================
// VELVETMEET /go REDIRECT
// 302 redirect with dynamic ?s= tracking + variant A/B
// =====================================

const AFFILIATE_BASE = "https://go.cm-trk6.com/aff_f?h=rA47F6";
const DEFAULT_SOURCE = "organic";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  let s = url.searchParams.get("s") || DEFAULT_SOURCE;
  s = s.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  if (!s) s = DEFAULT_SOURCE;
  
  // Variant number (0,1,2) for A/B tracking
  let v = url.searchParams.get("v") || "0";
  v = v.replace(/[^0-9]/g, "").slice(0, 1);
  if (!v || v < "0" || v > "2") v = "0";
  
  const target = AFFILIATE_BASE
    + "&aff_sub5=" + encodeURIComponent(s)
    + "&aff_sub4=" + encodeURIComponent("v" + v);
  
  return Response.redirect(target, 302);
}
