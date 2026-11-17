const params = new URLSearchParams(location.search);
const p = params.get("p");
if (p) {
  params.delete("p");
  const rest = params.toString();
  const suffix = rest ? `?${rest}` : "";
  history.replaceState(null, "", `${p}${suffix}`);
}

try {
  const saved = localStorage.getItem("theme-preference");
  if (saved === "light" || saved === "dark") {
    document.documentElement.dataset.theme = saved;
  } else {
    delete document.documentElement.dataset.theme;
  }
} catch {}
