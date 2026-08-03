import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CategoryDef {
  name: string;
  slug: string;
  departmentSlug: string;
  departmentName: string;
  keywords: string[];
  strongKeywords: string[];
  baseSeverity: "low" | "medium" | "high" | "critical";
  visualHints: string[];
}

const CATEGORIES: CategoryDef[] = [
  {
    name: "Garbage Collection",
    slug: "garbage-collection",
    departmentSlug: "waste",
    departmentName: "Waste Management",
    keywords: ["garbage", "trash", "rubbish", "litter", "bin", "bins", "waste", "collection", "pickup", "pick up", "overflow", "spilling", "garbage dump", "trash dump"],
    strongKeywords: ["garbage", "trash", "rubbish", "litter", "garbage dump", "trash dump"],
    baseSeverity: "medium",
    visualHints: ["brown", "green_waste", "scattered", "outdoor"],
  },
  {
    name: "Illegal Dumping",
    slug: "illegal-dumping",
    departmentSlug: "waste",
    departmentName: "Waste Management",
    keywords: ["dumping", "illegal", "debris", "dump", "dumped", "rubble", "abandoned", "construction waste", "industrial waste", "dump site", "dumping site"],
    strongKeywords: ["illegal dumping", "dumping", "dump site", "dumped", "illegal dump"],
    baseSeverity: "high",
    visualHints: ["brown", "mixed", "scattered", "outdoor"],
  },
  {
    name: "Road Potholes",
    slug: "road-potholes",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["pothole", "potholes", "pothole road", "crater", "hole in road", "road hole", "broken road surface", "damaged road", "road damage"],
    strongKeywords: ["pothole", "potholes", "crater", "hole in road"],
    baseSeverity: "high",
    visualHints: ["dark_spot", "gray", "road_surface", "outdoor"],
  },
  {
    name: "Broken Roads",
    slug: "broken-roads",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["broken", "cracked", "damaged", "road", "surface", "fissure", "crumbling", "road surface", "broken road", "cracked road", "road crack", "broken asphalt", "worn road"],
    strongKeywords: ["broken road", "cracked road", "cracked", "crumbling", "broken asphalt"],
    baseSeverity: "medium",
    visualHints: ["gray", "road_surface", "cracks", "outdoor"],
  },
  {
    name: "Broken Traffic Lights",
    slug: "broken-traffic-lights",
    departmentSlug: "traffic",
    departmentName: "Traffic Department",
    keywords: ["traffic", "signal", "signals", "traffic light", "traffic lights", "traffic signal", "red light", "amber", "green light", "junction", "intersection", "not working", "broken signal", "malfunctioning signal", "traffic signal broken"],
    strongKeywords: ["traffic light", "traffic signal", "broken signal", "traffic lights", "traffic signal broken", "broken traffic"],
    baseSeverity: "critical",
    visualHints: ["red", "green", "yellow", "tall_structure", "outdoor"],
  },
  {
    name: "Street Light Issues",
    slug: "street-light-issues",
    departmentSlug: "electricity",
    departmentName: "Electricity Department",
    keywords: ["street", "light", "lamp", "post", "pole", "dark", "lamp post", "lighting", "street light", "street lamp", "street light not working", "light pole", "street dark", "no light", "broken light", "fused", "flickering", "electrical"],
    strongKeywords: ["street light", "street lamp", "lamp post", "street dark", "no light", "broken light", "flickering"],
    baseSeverity: "medium",
    visualHints: ["dark", "tall_structure", "night", "yellow_glow"],
  },
  {
    name: "Water Leakage",
    slug: "water-leakage",
    departmentSlug: "water",
    departmentName: "Water Department",
    keywords: ["water", "leak", "pipe", "leakage", "supply", "burst", "flood", "tap", "water leak", "water pipe", "pipe burst", "water supply", "leaking water", "water flowing", "broken pipe", "water main", "drinking water"],
    strongKeywords: ["water leak", "water leakage", "pipe burst", "broken pipe", "water pipe", "leaking water", "water main"],
    baseSeverity: "high",
    visualHints: ["blue", "shiny", "wet", "outdoor"],
  },
  {
    name: "Sewer Overflow",
    slug: "sewer-overflow",
    departmentSlug: "sewer",
    departmentName: "Sewer Department",
    keywords: ["sewer", "sewage", "overflow", "drainage", "block", "clog", "backflow", "sewer overflow", "sewage overflow", "drain overflow", "blocked drain", "clogged drain", "sewer water", "wastewater", "drainage overflow"],
    strongKeywords: ["sewer overflow", "sewage overflow", "sewer", "sewage", "drain overflow", "blocked drain", "clogged drain"],
    baseSeverity: "high",
    visualHints: ["dark_brown", "wet", "shiny", "outdoor"],
  },
  {
    name: "Open Manholes",
    slug: "open-manholes",
    departmentSlug: "sewer",
    departmentName: "Sewer Department",
    keywords: ["manhole", "open", "cover", "missing", "pit", "danger", "open manhole", "missing cover", "manhole cover", "uncovered manhole", "exposed manhole", "open pit"],
    strongKeywords: ["manhole", "open manhole", "missing cover", "uncovered manhole", "exposed manhole"],
    baseSeverity: "critical",
    visualHints: ["dark_spot", "circular", "gray", "outdoor"],
  },
  {
    name: "Construction Debris",
    slug: "construction-debris",
    departmentSlug: "waste",
    departmentName: "Waste Management",
    keywords: ["debris", "construction", "rubble", "cement", "bricks", "concrete", "site", "construction waste", "building material", "construction site", "leftover material", "demolition", "demolition waste"],
    strongKeywords: ["construction debris", "debris", "construction waste", "rubble", "demolition", "building material"],
    baseSeverity: "medium",
    visualHints: ["gray", "brown", "mixed", "piled", "outdoor"],
  },
  {
    name: "Public Property Damage",
    slug: "public-property-damage",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["property", "damage", "damaged", "bench", "fence", "bus stop", "shelter", "vandalism", "public property", "broken bench", "damaged fence", "broken fence", "damaged shelter", "broken bus stop", "vandalised", "defaced", "public infrastructure"],
    strongKeywords: ["property damage", "public property", "vandalism", "vandalised", "damaged bench", "broken bench", "damaged fence", "defaced"],
    baseSeverity: "medium",
    visualHints: ["metal", "gray", "broken_structure", "outdoor"],
  },
  {
    name: "Fallen Trees",
    slug: "fallen-trees",
    departmentSlug: "parks",
    departmentName: "Parks Department",
    keywords: ["tree", "fallen", "branch", "uprooted", "storm", "trunk", "wood", "fallen tree", "fallen branch", "uprooted tree", "tree fall", "broken branch", "tree blocking", "tree on road", "fallen log"],
    strongKeywords: ["fallen tree", "uprooted", "fallen branch", "tree fall", "tree blocking", "tree on road"],
    baseSeverity: "high",
    visualHints: ["green", "brown", "organic", "outdoor"],
  },
  {
    name: "Other Civic Issues",
    slug: "other-civic-issues",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["other", "civic", "general", "issue", "problem", "complaint"],
    strongKeywords: [],
    baseSeverity: "low",
    visualHints: [],
  },
];

const SEVERITY_PRIORITY: Record<string, "low" | "normal" | "high" | "urgent"> = {
  low: "low",
  medium: "normal",
  high: "high",
  critical: "urgent",
};

const CRITICAL_HINTS = ["danger", "urgent", "injury", "injured", "accident", "child", "children", "school", "blind", "deadly", "live wire", "electrocution", "drowning", "collapsed", "fatal", "hazard", "hazardous", "immediate", "emergency"];
const HIGH_HINTS = ["overflow", "flood", "major", "large", "deep", "broken", "collapsed", "blocked", "severe", "extensive", "main road", "highway", "junction", "intersection", "hospital", "market", "busy", "heavy", "widespread", "urgent"];

interface ImageFeatures {
  avgBrightness: number;
  avgSaturation: number;
  dominantHue: number;
  greenRatio: number;
  blueRatio: number;
  brownRatio: number;
  grayRatio: number;
  redRatio: number;
  yellowRatio: number;
  darkSpotRatio: number;
  edgeDensity: number;
  scatterRatio: number;
  isNight: boolean;
}

function classifyPixel(r: number, g: number, b: number): { hue: string; color: string } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (max + min) / 2 / 255;
  const sat = max === min ? 0 : (max - min) / (max + min > 255 ? 510 - max - min : max + min);

  if (lum < 0.2) return { hue: "dark", color: "dark" };
  if (sat < 0.15 && lum > 0.3 && lum < 0.85) return { hue: "gray", color: "gray" };
  if (sat < 0.1) return { hue: "neutral", color: lum > 0.85 ? "white" : "gray" };

  let hue = 0;
  if (max === r) hue = ((g - b) / (max - min)) * 60;
  else if (max === g) hue = ((b - r) / (max - min)) * 60 + 120;
  else hue = ((r - g) / (max - min)) * 60 + 240;
  if (hue < 0) hue += 360;

  if (hue >= 85 && hue <= 170) {
    if (lum < 0.45) return { hue: "green", color: "green" };
    return { hue: "green", color: "green" };
  }
  if (hue >= 170 && hue <= 260) return { hue: "blue", color: "blue" };
  if (hue >= 20 && hue <= 50) {
    if (lum < 0.4) return { hue: "brown", color: "brown" };
    return { hue: "yellow", color: "yellow" };
  }
  if (hue < 20 || hue >= 340) return { hue: "red", color: "red" };
  return { hue: "other", color: "other" };
}

function scoreVisualFeatures(features: ImageFeatures, cat: CategoryDef): number {
  let score = 0;
  const hints = cat.visualHints;
  if (hints.length === 0) return 0;

  for (const hint of hints) {
    switch (hint) {
      case "green": if (features.greenRatio > 0.15) score += 3; break;
      case "brown": if (features.brownRatio > 0.12) score += 2; break;
      case "blue": if (features.blueRatio > 0.12) score += 3; break;
      case "gray": if (features.grayRatio > 0.3) score += 1.5; break;
      case "red": if (features.redRatio > 0.08) score += 2; break;
      case "yellow": if (features.yellowRatio > 0.08) score += 2; break;
      case "dark": if (features.isNight || features.avgBrightness < 0.25) score += 3; break;
      case "night": if (features.isNight) score += 4; break;
      case "dark_spot": if (features.darkSpotRatio > 0.1) score += 3; break;
      case "wet": if (features.avgSaturation > 0.3 && (features.blueRatio > 0.08 || features.brownRatio > 0.1)) score += 2; break;
      case "shiny": if (features.avgSaturation > 0.35) score += 1.5; break;
      case "scattered": if (features.scatterRatio > 0.3) score += 2; break;
      case "piled": if (features.scatterRatio > 0.2 && features.brownRatio > 0.08) score += 1.5; break;
      case "road_surface": if (features.grayRatio > 0.25) score += 2; break;
      case "cracks": if (features.edgeDensity > 0.15 && features.grayRatio > 0.2) score += 2; break;
      case "organic": if (features.greenRatio > 0.1 || features.brownRatio > 0.1) score += 2; break;
      case "mixed": if (features.brownRatio > 0.05 && features.grayRatio > 0.15) score += 1; break;
      case "tall_structure": if (features.edgeDensity < 0.12 && features.avgBrightness > 0.3) score += 1; break;
      case "broken_structure": if (features.edgeDensity > 0.1) score += 1.5; break;
      case "circular": if (features.darkSpotRatio > 0.05 && features.grayRatio > 0.15) score += 1.5; break;
      case "outdoor": if (features.avgBrightness > 0.2) score += 0.5; break;
      case "yellow_glow": if (features.yellowRatio > 0.05 && features.isNight) score += 2; break;
      case "metal": if (features.grayRatio > 0.2 && features.avgSaturation < 0.2) score += 1; break;
    }
  }
  return score;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

function scoreCategoryText(text: string, tokens: string[], cat: CategoryDef): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of cat.keywords) {
    if (kw.includes(" ")) {
      if (lower.includes(kw)) score += 3;
    } else if (tokens.includes(kw)) {
      score += 2;
    }
  }
  for (const skw of cat.strongKeywords) {
    if (skw.includes(" ")) {
      if (lower.includes(skw)) score += 6;
    } else if (tokens.includes(skw)) {
      score += 4;
    }
  }
  if (cat.slug === "other-civic-issues" && score === 0) score = 0.5;
  return score;
}

interface CategoryScore {
  cat: CategoryDef;
  total: number;
  textScore: number;
  visualScore: number;
  confidence: number;
}

function detectCategory(text: string, tokens: string[], features: ImageFeatures | null): CategoryScore {
  const scores: CategoryScore[] = [];
  for (const cat of CATEGORIES) {
    const textScore = scoreCategoryText(text, tokens, cat);
    let visualScore = 0;
    if (features) visualScore = scoreVisualFeatures(features, cat);
    const total = textScore + visualScore;
    const confidence = total > 0 ? Math.min(1, (textScore * 0.6 + visualScore * 0.4) / 8) : 0;
    scores.push({ cat, total, textScore, visualScore, confidence });
  }
  scores.sort((a, b) => b.total - a.total);
  return scores[0];
}

function estimateSeverity(cat: CategoryDef, text: string, features: ImageFeatures | null): "low" | "medium" | "high" | "critical" {
  const lower = text.toLowerCase();
  let sev = cat.baseSeverity;

  if (CRITICAL_HINTS.some((h) => lower.includes(h))) {
    sev = "critical";
  } else if (HIGH_HINTS.some((h) => lower.includes(h))) {
    if (sev === "low") sev = "medium";
    else if (sev === "medium") sev = "high";
    else sev = "high";
  }

  if (features) {
    if (features.isNight && (cat.slug === "broken-traffic-lights" || cat.slug === "street-light-issues")) {
      if (sev === "medium" || sev === "low") sev = "high";
    }
    if (features.darkSpotRatio > 0.2 && cat.slug === "open-manholes") sev = "critical";
    if (features.edgeDensity > 0.25 && (cat.slug === "road-potholes" || cat.slug === "broken-roads")) {
      if (sev === "medium") sev = "high";
    }
  }
  return sev;
}

function buildTitle(cat: CategoryDef, severity: string): string {
  const prefix = severity === "critical" ? "URGENT: " : severity === "high" ? "High Priority: " : "";
  return `${prefix}${cat.name} reported`;
}

function buildDescription(cat: CategoryDef, severity: string, address: string, note: string): string {
  const parts: string[] = [];
  parts.push(`Automated analysis identified this as a ${cat.name.toLowerCase()} issue.`);
  parts.push(`Estimated severity: ${severity.toUpperCase()}. Routed to the ${cat.departmentName}.`);
  if (address) parts.push(`Reported location: ${address}.`);
  if (note) parts.push(`Citizen note: "${note.trim()}".`);
  parts.push("Recommended immediate inspection and appropriate remediation per municipal SOP.");
  return parts.join(" ");
}

function buildSummary(cat: CategoryDef, severity: string, priority: string, confidence: number): string {
  const confLabel = confidence > 0.7 ? "high confidence" : confidence > 0.4 ? "moderate confidence" : "low confidence";
  return `${cat.name} (${severity} severity, ${priority} priority) auto-routed to ${cat.departmentName} (${confLabel}).`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const note: string = (body.note || "").toString().trim();
    const address: string = (body.address || "").toString().trim();
    const ward: string = (body.ward || "").toString().trim();
    const fileName: string = (body.fileName || "").toString().trim();
    const hasImage: boolean = !!body.imageFeatures;
    const features: ImageFeatures | null = body.imageFeatures ?? null;

    const combinedText = `${note} ${address} ${ward} ${fileName}`;
    const tokens = tokenize(combinedText);

    console.log("[analyze-complaint] input", { note, address, ward, fileName, hasLat: !!body.latitude, hasLng: !!body.longitude, hasImage, featureKeys: features ? Object.keys(features) : [] });

    const best = detectCategory(combinedText, tokens, features);

    const CONFIDENCE_THRESHOLD = 0.35;
    const MIN_TOTAL_SCORE = 2.5;
    const otherCat = CATEGORIES[CATEGORIES.length - 1];
    let finalCat = best.cat;
    let finalConfidence = best.confidence;

    if (best.total < MIN_TOTAL_SCORE || best.confidence < CONFIDENCE_THRESHOLD) {
      console.log("[analyze-complaint] low confidence, falling back to Other Civic Issues", { bestCategory: best.cat.name, total: best.total, confidence: best.confidence });
      finalCat = otherCat;
      finalConfidence = Math.max(best.confidence, 0.1);
    }

    const severity = estimateSeverity(finalCat, combinedText, features);
    const priority = SEVERITY_PRIORITY[severity];

    console.log("[analyze-complaint] classification", { category: finalCat.name, slug: finalCat.slug, department: finalCat.departmentName, severity, priority, confidence: finalConfidence, textScore: best.textScore, visualScore: best.visualScore });

    let duplicateOf: string | null = null;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    if (body.latitude && body.longitude) {
      const lat = Number(body.latitude);
      const lng = Number(body.longitude);
      const since = new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString();

      const { data: timelineRows, error: tlQueryError } = await supabase
        .from("complaint_timeline")
        .select("complaint_id")
        .gte("created_at", since);
      if (tlQueryError) {
        console.error("[analyze-complaint] timeline lookup failed", tlQueryError);
      }
      const fullySavedIds = timelineRows?.map((r) => r.complaint_id) ?? [];
      if (fullySavedIds.length === 0) {
        console.log("[analyze-complaint] no fully-saved complaints found, no duplicate check");
      } else {
        const { data: recent, error: dupError } = await supabase
          .from("complaints")
          .select("id, latitude, longitude, created_at")
          .eq("category_slug", finalCat.slug)
          .gte("created_at", since)
          .neq("status", "resolved")
          .neq("status", "rejected")
          .in("id", fullySavedIds)
          .limit(20);
        if (dupError) {
          console.error("[analyze-complaint] duplicate check query failed", dupError);
        }
        if (recent && recent.length) {
          for (const r of recent) {
            if (r.latitude == null || r.longitude == null) continue;
            const dLat = Number(r.latitude) - lat;
            const dLng = Number(r.longitude) - lng;
            const distM = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
            if (distM < 200) {
              duplicateOf = r.id;
              break;
            }
          }
        }
      }
    }

    const result = {
      category: finalCat.name,
      category_slug: finalCat.slug,
      department_slug: finalCat.departmentSlug,
      department_name: finalCat.departmentName,
      severity,
      priority,
      confidence: Math.round(finalConfidence * 100) / 100,
      ai_title: buildTitle(finalCat, severity),
      ai_description: buildDescription(finalCat, severity, address, note),
      ai_summary: buildSummary(finalCat, severity, priority, finalConfidence),
      duplicate_of: duplicateOf,
    };

    console.log("[analyze-complaint] result", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[analyze-complaint] error", err);
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
