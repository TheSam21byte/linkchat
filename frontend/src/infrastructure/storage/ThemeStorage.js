export function getTheme() {
  return localStorage.getItem("linkchat-theme") ?? "dark";
}

export function applyTheme(theme) {
  const normalizedTheme = theme === "light" ? "light" : "dark";

  document.documentElement.classList.toggle("dark", normalizedTheme === "dark");
  document.documentElement.dataset.theme = normalizedTheme;
  localStorage.setItem("linkchat-theme", normalizedTheme);

  return normalizedTheme;
}

export function initializeTheme() {
  applyTheme(getTheme());
}
