/** 카탈로그 필터용 메타데이터 */

function inferColorFamily(name) {
  if (/clear|moist/i.test(name)) return "clear";
  if (/gray|grey/i.test(name)) return "gray";
  if (/choco/i.test(name)) return "choco";
  if (/brown|ocher|freesia|ivy|posy|calla/i.test(name)) return "brown";
  if (/ash|almond/i.test(name)) return "almond";
  if (/black/i.test(name)) return "black";
  return "brown";
}

function inferLook(id, name) {
  const n = Number(id.replace(/\D/g, "")) || 0;
  const looks = ["natural", "no-ring", "with-ring", "big-eye", "wedding", "bright", "sensitive"];
  if (/clear|moist/i.test(name)) return "sensitive";
  if (/gray|daisy|bluebell/i.test(name)) return "natural";
  if (n % 7 === 3) return "big-eye";
  if (n % 7 === 4) return "wedding";
  return looks[n % looks.length];
}

export function enrichCatalogMeta(p) {
  if (p.catalog) return p;

  if (p.category === "contact-lenses") {
    const diameter = p.name.includes("Big") ? "14.5" : "14.2";
    return {
      ...p,
      catalog: {
        colorFamily: inferColorFamily(p.name),
        look: inferLook(p.id, p.name),
        diameter,
        waterContent: "48",
        baseCurve: "8.6",
        lifespan: "6months",
        prescription: "normal",
      },
    };
  }

  if (p.category === "solutions") {
    const sub = /drop|lycee|soft/i.test(p.name) ? "drops" : "mps";
    return {
      ...p,
      catalog: {
        colorFamily: "none",
        look: "none",
        diameter: "",
        waterContent: "",
        baseCurve: "",
        lifespan: "daily",
        prescription: "none",
        sub,
      },
    };
  }

  if (p.category === "accessories") {
    let sub = "cleaner";
    if (/travel|case/i.test(p.name)) sub = "travel";
    if (/wipe|saline/i.test(p.name)) sub = "cleaner";
    return {
      ...p,
      catalog: {
        colorFamily: "none",
        look: "none",
        diameter: "",
        waterContent: "",
        baseCurve: "8.6",
        lifespan: "",
        prescription: "none",
        sub,
      },
    };
  }

  return {
    ...p,
    catalog: {
      colorFamily: "none",
      look: "none",
      diameter: "",
      waterContent: "48",
      baseCurve: "8.6",
      lifespan: "6months",
      prescription: "none",
    },
  };
}
