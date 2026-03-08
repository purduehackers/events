import { EVENT_CATEGORIES } from "@/types";

declare global {
  interface Window {
    knownEventCategories?: string[];
    applyCategoryFilter?: () => void;
  }
}

const getCategoryParam = () => {
  const cat = new URLSearchParams(window.location.search).get("cat");
  return cat?.trim().toLowerCase() ?? null;
};

export function applyCategoryFilter() {
  const catParam = getCategoryParam();
  window.dispatchEvent(
    new CustomEvent<string | null>("pastEvents:categoryChange", {
      detail: catParam,
    })
  );
}

// Expose globally for components to call after updating URL params
window.applyCategoryFilter = applyCategoryFilter;
