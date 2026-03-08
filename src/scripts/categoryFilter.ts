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
  const shouldFilter = Boolean(catParam);
  const known = (window.knownEventCategories ?? EVENT_CATEGORIES).map((c) => c.toLowerCase());
  const isOther = catParam === "other";

  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-category]"));
  cards.forEach((card) => {
    const cardCategory = card.dataset.category?.toLowerCase() ?? "";
    const show =
      !shouldFilter ||
      (isOther ? (cardCategory !== "" && !known.includes(cardCategory)) : cardCategory === catParam);

    card.style.display = show ? "" : "none";
  });

  // Hide semester sections if no visible cards
  const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-sem-key]"));
  sections.forEach((section) => {
    const sectionCards = Array.from(section.querySelectorAll<HTMLElement>("[data-category]"));
    const hasVisibleCard = sectionCards.some((c) => c.style.display !== "none");
    section.style.display = hasVisibleCard ? "" : "none";
  });

  // Hide current events container if no visible cards
  const currentContainer = document.querySelector<HTMLElement>("[data-category-section=\"current-events\"]");
  if (currentContainer) {
    const currentCards = Array.from(currentContainer.querySelectorAll<HTMLElement>("[data-category]"));
    const hasVisibleCard = currentCards.some((c) => c.style.display !== "none");
    currentContainer.style.display = hasVisibleCard ? "" : "none";
  }

  window.dispatchEvent(
    new CustomEvent<string | null>("pastEvents:categoryChange", {
      detail: catParam,
    })
  );
}

// Expose globally for components to call after updating URL params
window.applyCategoryFilter = applyCategoryFilter;

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", applyCategoryFilter, { once: true });
} else {
  applyCategoryFilter();
}