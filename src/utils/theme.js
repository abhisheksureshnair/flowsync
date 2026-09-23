// Central theme manager for FlowSync
export const THEMES = [
  {
    id: "dark-default",
    name: "FlowSync Dark",
    tagline: "Default Electric Navy",
    bg: "#0B1020",
    sidebar: "#151820",
    accent: "#5B8CFF"
  },
  {
    id: "midnight",
    name: "Midnight OLED",
    tagline: "High Contrast Pitch Black",
    bg: "#05070C",
    sidebar: "#0D0F17",
    accent: "#7C5CFF"
  },
  {
    id: "cyber-violet",
    name: "Cyber Violet",
    tagline: "Neon AI Ambient",
    bg: "#0D0A18",
    sidebar: "#171226",
    accent: "#A855F7"
  },
  {
    id: "emerald",
    name: "Forest Emerald",
    tagline: "Natural Focus Green",
    bg: "#08120D",
    sidebar: "#101D17",
    accent: "#10B981"
  },
  {
    id: "light",
    name: "Clean Light",
    tagline: "Daytime High Visibility",
    bg: "#F4F6FB",
    sidebar: "#FFFFFF",
    accent: "#3B82F6"
  }
];

export const getSavedTheme = () => {
  try {
    return localStorage.getItem("flowsync_theme") || "dark-default";
  } catch {
    return "dark-default";
  }
};

export const applyTheme = (themeId) => {
  try {
    localStorage.setItem("flowsync_theme", themeId);
    document.documentElement.setAttribute("data-theme", themeId);
    window.dispatchEvent(new CustomEvent("flowsync_theme_change", { detail: themeId }));
  } catch (err) {
    console.error("Failed to apply theme:", err);
  }
};

export const initTheme = () => {
  const theme = getSavedTheme();
  document.documentElement.setAttribute("data-theme", theme);
  return theme;
};
