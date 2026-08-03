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
}

const CATEGORIES: CategoryDef[] = [
  {
    name: "Garbage Collection",
    slug: "garbage-collection",
    departmentSlug: "waste",
    departmentName: "Waste Management",
    keywords: ["garbage", "trash", "rubbish", "litter", "bin", "bins", "waste", "collection", "pickup", "pick up", "dump", "overflow", "spilling", "garbage dump", "trash dump"],
    strongKeywords: ["garbage", "trash", "rubbish", "litter", "garbage dump", "trash dump"],
    baseSeverity: "medium",
  },
  {
    name: "Illegal Dumping",
    slug: "illegal-dumping",
    departmentSlug: "waste",
    departmentName: "Waste Management",
    keywords: ["dumping", "illegal", "debris", "dump", "dumped", "rubble", "abandoned", "construction waste", "industrial waste", "dump site", "dumping site"],
    strongKeywords: ["illegal dumping", "dumping", "dump site", "dumped", "illegal dump"],
    baseSeverity: "high",
  },
  {
    name: "Road Potholes",
    slug: "road-potholes",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["pothole", "potholes", "pothole road", "crater", "hole in road", "road hole", "broken road surface", "damaged road", "road damage"],
    strongKeywords: ["pothole", "potholes", "crater", "hole in road"],
    baseSeverity: "high",
  },
  {
    name: "Broken Roads",
    slug: "broken-roads",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["broken", "cracked", "damaged", "road", "surface", "fissure", "crumbling", "road surface", "broken road", "cracked road", "road crack", "broken asphalt", "worn road"],
    strongKeywords: ["broken road", "cracked road", "cracked", "crumbling", "broken asphalt"],
    baseSeverity: "medium",
  },
  {
    name: "Broken Traffic Lights",
    slug: "broken-traffic-lights",
    departmentSlug: "traffic",
    departmentName: "Traffic Department",
    keywords: ["traffic", "signal", "signals", "traffic light", "traffic lights", "traffic signal", "red light", "amber", "green light", "junction", "intersection", "not working", "broken signal", "malfunctioning signal", "traffic signal broken"],
    strongKeywords: ["traffic light", "traffic signal", "broken signal", "traffic lights", "traffic signal broken", "broken traffic"],
    baseSeverity: "critical",
  },
  {
    name: "Street Light Issues",
    slug: "street-light-issues",
    departmentSlug: "electricity",
    departmentName: "Electricity Department",
    keywords: ["street", "light", "lamp", "post", "pole", "dark", "lamp post", "lighting", "street light", "street lamp", "street light not working", "light pole", "street dark", "no light", "broken light", "fused", "flickering", "electrical"],
    strongKeywords: ["street light", "street lamp", "lamp post", "street dark", "no light", "broken light", "flickering"],
    baseSeverity: "medium",
  },
  {
    name: "Water Leakage",
    slug: "water-leakage",
    departmentSlug: "water",
    departmentName: "Water Department",
    keywords: ["water", "leak", "pipe", "leakage", "supply", "burst", "flood", "tap", "water leak", "water pipe", "pipe burst", "water supply", "leaking water", "water flowing", "broken pipe", "water main", "drinking water"],
    strongKeywords: ["water leak", "water leakage", "pipe burst", "broken pipe", "water pipe", "leaking water", "water main"],
    baseSeverity: "high",
  },
  {
    name: "Sewer Overflow",
    slug: "sewer-overflow",
    departmentSlug: "sewer",
    departmentName: "Sewer Department",
    keywords: ["sewer", "sewage", "overflow", "drainage", "block", "clog", "backflow", "sewer overflow", "sewage overflow", "drain overflow", "blocked drain", "clogged drain", "sewer water", "wastewater", "drainage overflow"],
    strongKeywords: ["sewer overflow", "sewage overflow", "sewer", "sewage", "drain overflow", "blocked drain", "clogged drain"],
    baseSeverity: "high",
  },
  {
    name: "Open Manholes",
    slug: "open-manholes",
    departmentSlug: "sewer",
    departmentName: "Sewer Department",
    keywords: ["manhole", "open", "cover", "missing", "pit", "danger", "open manhole", "missing cover", "manhole cover", "uncovered manhole", "exposed manhole", "open pit"],
    strongKeywords: ["manhole", "open manhole", "missing cover", "uncovered manhole", "exposed manhole"],
    baseSeverity: "critical",
  },
  {
    name: "Construction Debris",
    slug: "construction-debris",
    departmentSlug: "waste",
    departmentName: "Waste Management",
    keywords: ["debris", "construction", "rubble", "cement", "bricks", "concrete", "site", "construction waste", "building material", "construction site", "leftover material", "demolition", "demolition waste"],
    strongKeywords: ["construction debris", "debris", "construction waste", "rubble", "demolition", "building material"],
    baseSeverity: "medium",
  },
  {
    name: "Public Property Damage",
    slug: "public-property-damage",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["property", "damage", "damaged", "bench", "fence", "bus stop", "shelter", "vandalism", "public property", "broken bench", "damaged fence", "broken fence", "damaged shelter", "broken bus stop", "vandalised", "defaced", "public infrastructure"],
    strongKeywords: ["property damage", "public property", "vandalism", "vandalised", "damaged bench", "broken bench", "damaged fence", "defaced"],
    baseSeverity: "medium",
  },
  {
    name: "Fallen Trees",
    slug: "fallen-trees",
    departmentSlug: "parks",
    departmentName: "Parks Department",
    keywords: ["tree", "fallen", "branch", "uprooted", "storm", "trunk", "wood", "fallen tree", "fallen branch", "uprooted tree", "tree fall", "broken branch", "tree blocking", "tree on road", "fallen log"],
    strongKeywords: ["fallen tree", "uprooted", "fallen branch", "tree fall", "tree blocking", "tree on road"],
    baseSeverity: "high",
  },
  {
    name: "Other Civic Issues",
    slug: "other-civic-issues",
    departmentSlug: "road",
    departmentName: "Road Department",
    keywords: ["other", "civic", "general", "issue", "problem", "complaint"],
    strongKeywords: [],
    baseSeverity: "low",
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

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

function scoreCategory(text: string, tokens: string[], cat: CategoryDef): number {
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
      if (lower.includes(skw)) score += 5;
    } else if (tokens.includes(skw)) {
      score += 4;
    }
  }

  if (cat.slug === "other-civic-issues" && score === 0) score = 1;
  return score;
}

function detectCategory(text: string, tokens: string[]): CategoryDef {
  let best: CategoryDef = CATEGORIES[CATEGORIES.length - 1];
  let bestScore = 0;
  for (const cat of CATEGORIES) {
    const s = scoreCategory(text, tokens, cat);
    if (s > bestScore) {
      bestScore = s;
      best = cat;
    }
  }
  return best;
}

function estimateSeverity(cat: CategoryDef, text: string): "low" | "medium" | "high" | "critical" {
  const lower = text.toLowerCase();
  let sev = cat.baseSeverity;

  if (CRITICAL_HINTS.some((h) => lower.includes(h))) {
    sev = "critical";
  } else if (HIGH_HINTS.some((h) => lower.includes(h))) {
    if (sev === "low") sev = "medium";
    else if (sev === "medium") sev = "high";
    else sev = "high";
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

function buildSummary(cat: CategoryDef, severity: string, priority: string): string {
  return `${cat.name} (${severity} severity, ${priority} priority) auto-routed to ${cat.departmentName}.`;
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

    const combinedText = `${note} ${address} ${ward} ${fileName}`;
    const tokens = tokenize(combinedText);

    console.log("[analyze-complaint] input", { note, address, ward, fileName, hasLat: !!body.latitude, hasLng: !!body.longitude });

    const cat = detectCategory(combinedText, tokens);
    const severity = estimateSeverity(cat, combinedText);
    const priority = SEVERITY_PRIORITY[severity];

    console.log("[analyze-complaint] classification", { category: cat.name, slug: cat.slug, department: cat.departmentName, severity, priority });

    let duplicateOf: string | null = null;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    if (body.latitude && body.longitude) {
      const lat = Number(body.latitude);
      const lng = Number(body.longitude);
      const { data: recent, error: dupError } = await supabase
        .from("complaints")
        .select("id, latitude, longitude, created_at")
        .eq("category_slug", cat.slug)
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString())
        .neq("status", "resolved")
        .neq("status", "rejected")
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

    const result = {
      category: cat.name,
      category_slug: cat.slug,
      department_slug: cat.departmentSlug,
      department_name: cat.departmentName,
      severity,
      priority,
      ai_title: buildTitle(cat, severity),
      ai_description: buildDescription(cat, severity, address, note),
      ai_summary: buildSummary(cat, severity, priority),
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
