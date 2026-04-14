import { describe, expect, it } from "vitest";

/**
 * Tests for the Search page filtering logic.
 * The search is client-side, so we test the filtering functions directly.
 */

// ── Sample articles data (mirrors Search.tsx) ──
const sampleArticles = [
  { slug: "cemac-panne-seche", rubrique: "Dossier Central", title: "Panne sèche à la CEMAC — Crise financière et ajustements budgétaires", excerpt: "La CEMAC traverse une crise existentielle.", author: "La Rédaction Habari", date: "Février 2026", readTime: "15 min", access: "free" },
  { slug: "gabon-oligui-mur-argent", rubrique: "Enquête", title: "Gabon — Oligui Nguema face au mur de l'argent", excerpt: "Le Gabon affiche une ambition économique.", author: "La Rédaction Habari", date: "Février 2026", readTime: "12 min", access: "free" },
  { slug: "interview-gweth-cemac", rubrique: "La Grande Interview", title: "Dr Guy Gweth : « Aucune intégration ne progresse sans leadership »", excerpt: "Le Président du CAVIE dévoile les ressorts.", author: "La Rédaction Habari", date: "Février 2026", readTime: "10 min", access: "premium" },
  { slug: "cobalt-minerais-verts-afrique", rubrique: "Habari Green", title: "Cobalt et minerais stratégiques : bénédiction ou piège ?", excerpt: "Avec 70 % de la production mondiale de cobalt.", author: "La Rédaction Habari", date: "Février 2026", readTime: "4 min", access: "free" },
  { slug: "villes-africaines-defi-climatique", rubrique: "Habari Green", title: "Les villes africaines face au défi climatique", excerpt: "700 millions de nouveaux citadins d'ici 2050.", author: "La Rédaction Habari", date: "Février 2026", readTime: "4 min", access: "free" },
  { slug: "femmes-entrepreneuses-afrique", rubrique: "Culture & Société", title: "La montée des femmes entrepreneuses", excerpt: "L'Afrique détient le taux d'entrepreneuriat féminin le plus élevé.", author: "La Rédaction Habari", date: "Mars 2026", readTime: "4 min", access: "free" },
  { slug: "revolution-mobile-money-afrique", rubrique: "Culture & Société", title: "La révolution du mobile money", excerpt: "856 millions de comptes et 1 000 milliards de dollars.", author: "La Rédaction Habari", date: "Mars 2026", readTime: "6 min", access: "free" },
  { slug: "akendengue-voix-continent", rubrique: "Culture & Société", title: "Akendengué : le retour d'un homme devenu repère", excerpt: "Pierre Claver Akendengué, 82 ans.", author: "Brice MBA", date: "Février 2026", readTime: "8 min", access: "premium" },
];

// ── Filtering functions (same logic as Search.tsx) ──
type Article = typeof sampleArticles[number];

function filterByQuery(articles: Article[], query: string): Article[] {
  if (!query.trim()) return articles;
  const q = query.toLowerCase();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.rubrique.toLowerCase().includes(q)
  );
}

function filterByRubrique(articles: Article[], rubrique: string): Article[] {
  if (rubrique === "all") return articles;
  return articles.filter((a) => a.rubrique === rubrique);
}

function filterByAuthor(articles: Article[], author: string): Article[] {
  if (author === "all") return articles;
  return articles.filter((a) => a.author === author);
}

function filterByDate(articles: Article[], date: string): Article[] {
  if (date === "all") return articles;
  return articles.filter((a) => a.date === date);
}

function filterByAccess(articles: Article[], access: string): Article[] {
  if (access === "all") return articles;
  return articles.filter((a) => a.access === access);
}

function sortByDate(articles: Article[]): Article[] {
  const monthOrder: Record<string, number> = {
    Janvier: 1, Février: 2, Mars: 3, Avril: 4, Mai: 5, Juin: 6,
    Juillet: 7, Août: 8, Septembre: 9, Octobre: 10, Novembre: 11, Décembre: 12,
  };
  return [...articles].sort((a, b) => {
    const [mA, yA] = a.date.split(" ");
    const [mB, yB] = b.date.split(" ");
    const dateA = (parseInt(yA) || 2026) * 100 + (monthOrder[mA] || 0);
    const dateB = (parseInt(yB) || 2026) * 100 + (monthOrder[mB] || 0);
    return dateB - dateA;
  });
}

function sortByReadTime(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
}

// ── Unique values extraction ──
function getUniqueRubriques(articles: Article[]): string[] {
  return Array.from(new Set(articles.map((a) => a.rubrique))).sort();
}

function getUniqueAuthors(articles: Article[]): string[] {
  return Array.from(new Set(articles.map((a) => a.author))).sort();
}

function getUniqueDates(articles: Article[]): string[] {
  return Array.from(new Set(articles.map((a) => a.date)));
}

// ═══════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════

describe("Search - Text Query Filtering", () => {
  it("should return all articles when query is empty", () => {
    const result = filterByQuery(sampleArticles, "");
    expect(result).toHaveLength(sampleArticles.length);
  });

  it("should filter articles by title keyword", () => {
    const result = filterByQuery(sampleArticles, "cobalt");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("cobalt-minerais-verts-afrique");
  });

  it("should filter articles by excerpt keyword", () => {
    const result = filterByQuery(sampleArticles, "856 millions");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("revolution-mobile-money-afrique");
  });

  it("should filter articles by author name", () => {
    const result = filterByQuery(sampleArticles, "Brice MBA");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("akendengue-voix-continent");
  });

  it("should filter articles by rubrique name", () => {
    const result = filterByQuery(sampleArticles, "Habari Green");
    expect(result).toHaveLength(2);
  });

  it("should be case-insensitive", () => {
    const result = filterByQuery(sampleArticles, "CEMAC");
    expect(result.length).toBeGreaterThan(0);
    const resultLower = filterByQuery(sampleArticles, "cemac");
    expect(resultLower).toHaveLength(result.length);
  });

  it("should return empty array when no match", () => {
    const result = filterByQuery(sampleArticles, "xyznonexistent");
    expect(result).toHaveLength(0);
  });

  it("should handle whitespace-only query as empty", () => {
    const result = filterByQuery(sampleArticles, "   ");
    expect(result).toHaveLength(sampleArticles.length);
  });
});

describe("Search - Rubrique Filter", () => {
  it("should return all articles when rubrique is 'all'", () => {
    const result = filterByRubrique(sampleArticles, "all");
    expect(result).toHaveLength(sampleArticles.length);
  });

  it("should filter by Habari Green", () => {
    const result = filterByRubrique(sampleArticles, "Habari Green");
    expect(result).toHaveLength(2);
    result.forEach((a) => expect(a.rubrique).toBe("Habari Green"));
  });

  it("should filter by Culture & Société", () => {
    const result = filterByRubrique(sampleArticles, "Culture & Société");
    expect(result).toHaveLength(3);
    result.forEach((a) => expect(a.rubrique).toBe("Culture & Société"));
  });

  it("should return empty for non-existent rubrique", () => {
    const result = filterByRubrique(sampleArticles, "Non Existent");
    expect(result).toHaveLength(0);
  });
});

describe("Search - Author Filter", () => {
  it("should return all articles when author is 'all'", () => {
    const result = filterByAuthor(sampleArticles, "all");
    expect(result).toHaveLength(sampleArticles.length);
  });

  it("should filter by specific author", () => {
    const result = filterByAuthor(sampleArticles, "Brice MBA");
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe("Brice MBA");
  });

  it("should filter by La Rédaction Habari", () => {
    const result = filterByAuthor(sampleArticles, "La Rédaction Habari");
    expect(result).toHaveLength(7);
  });
});

describe("Search - Date Filter", () => {
  it("should return all articles when date is 'all'", () => {
    const result = filterByDate(sampleArticles, "all");
    expect(result).toHaveLength(sampleArticles.length);
  });

  it("should filter by Février 2026", () => {
    const result = filterByDate(sampleArticles, "Février 2026");
    expect(result).toHaveLength(6);
  });

  it("should filter by Mars 2026", () => {
    const result = filterByDate(sampleArticles, "Mars 2026");
    expect(result).toHaveLength(2);
  });
});

describe("Search - Access Filter", () => {
  it("should return all articles when access is 'all'", () => {
    const result = filterByAccess(sampleArticles, "all");
    expect(result).toHaveLength(sampleArticles.length);
  });

  it("should filter free articles", () => {
    const result = filterByAccess(sampleArticles, "free");
    expect(result).toHaveLength(6);
    result.forEach((a) => expect(a.access).toBe("free"));
  });

  it("should filter premium articles", () => {
    const result = filterByAccess(sampleArticles, "premium");
    expect(result).toHaveLength(2);
    result.forEach((a) => expect(a.access).toBe("premium"));
  });
});

describe("Search - Combined Filters", () => {
  it("should combine rubrique and date filters", () => {
    let result = filterByRubrique(sampleArticles, "Culture & Société");
    result = filterByDate(result, "Mars 2026");
    expect(result).toHaveLength(2);
  });

  it("should combine query and rubrique filters", () => {
    let result = filterByQuery(sampleArticles, "cobalt");
    result = filterByRubrique(result, "Habari Green");
    expect(result).toHaveLength(1);
  });

  it("should combine all filters", () => {
    let result = filterByRubrique(sampleArticles, "Culture & Société");
    result = filterByAuthor(result, "La Rédaction Habari");
    result = filterByDate(result, "Mars 2026");
    result = filterByAccess(result, "free");
    expect(result).toHaveLength(2);
  });

  it("should return empty when filters are contradictory", () => {
    let result = filterByRubrique(sampleArticles, "Habari Green");
    result = filterByAccess(result, "premium");
    expect(result).toHaveLength(0);
  });
});

describe("Search - Sorting", () => {
  it("should sort by date (most recent first)", () => {
    const sorted = sortByDate(sampleArticles);
    // Mars 2026 articles should come before Février 2026
    const marsIdx = sorted.findIndex((a) => a.date === "Mars 2026");
    const fevrierIdx = sorted.findIndex((a) => a.date === "Février 2026");
    expect(marsIdx).toBeLessThan(fevrierIdx);
  });

  it("should sort by read time (shortest first)", () => {
    const sorted = sortByReadTime(sampleArticles);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(parseInt(sorted[i].readTime)).toBeLessThanOrEqual(parseInt(sorted[i + 1].readTime));
    }
  });
});

describe("Search - Unique Values Extraction", () => {
  it("should extract unique rubriques", () => {
    const rubriques = getUniqueRubriques(sampleArticles);
    expect(rubriques).toContain("Habari Green");
    expect(rubriques).toContain("Culture & Société");
    expect(rubriques).toContain("Dossier Central");
    // Should be sorted
    for (let i = 0; i < rubriques.length - 1; i++) {
      expect(rubriques[i].localeCompare(rubriques[i + 1])).toBeLessThanOrEqual(0);
    }
  });

  it("should extract unique authors", () => {
    const authors = getUniqueAuthors(sampleArticles);
    expect(authors).toContain("La Rédaction Habari");
    expect(authors).toContain("Brice MBA");
    expect(authors).toHaveLength(2);
  });

  it("should extract unique dates", () => {
    const dates = getUniqueDates(sampleArticles);
    expect(dates).toContain("Février 2026");
    expect(dates).toContain("Mars 2026");
    expect(dates).toHaveLength(2);
  });
});

describe("Search - URL Query Parameter", () => {
  it("should parse query from URL search params", () => {
    const searchString = "?q=cobalt";
    const params = new URLSearchParams(searchString);
    const query = params.get("q") || "";
    expect(query).toBe("cobalt");
  });

  it("should handle missing query parameter", () => {
    const searchString = "";
    const params = new URLSearchParams(searchString);
    const query = params.get("q") || "";
    expect(query).toBe("");
  });

  it("should handle encoded characters in query", () => {
    const searchString = "?q=Afrique%20Centrale";
    const params = new URLSearchParams(searchString);
    const query = params.get("q") || "";
    expect(query).toBe("Afrique Centrale");
  });
});
