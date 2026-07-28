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
  baseSeverity: "low" | "medium" | "high" | "critical";
}

const CATEGORIES: CategoryDef[] = [
  { name: "Garbage Collection", slug: "garbage-collection", departmentSlug: "waste", departmentName: "Waste Management", keywords: ["garbage","trash","waste","bin","collection","pickup","rubbish","litter"], baseSeverity: "medium" },
  { name: "Illegal Dumping", slug: "illegal-dumping", departmentSlug: "waste", departmentName: "Waste Management", keywords: ["dumping","illegal","debris","dump","construction","rubble","abandoned"], baseSeverity: "high" },
  { name: "Road Potholes", slug: "road-potholes", departmentSlug: "road", departmentName: "Road Department", keywords: ["pothole","potholes","crater","hole","road","surface","cave"], baseSeverity: "high" },
  { name: "Broken Roads", slug: "broken-roads", departmentSlug: "road", departmentName: "Road Department", keywords: ["broken","cracked","damaged","road","surface","fissure","crumbling"], baseSeverity: "medium" },
  { name: "Broken Traffic Lights", slug: "broken-traffic-lights", departmentSlug: "traffic", departmentName: "Traffic Department", keywords: ["traffic","signal","light","red","amber","green","junction","intersection","not working"], baseSeverity: "critical" },
  { name: "Street Light Issues", slug: "street-light-issues", departmentSlug: "electricity", departmentName: "Electricity Department", keywords: ["street","light","lamp","post","pole","dark","lamp post","lighting"], baseSeverity: "medium" },
  { name: "Water Leakage", slug: "water-leakage", departmentSlug: "water", departmentName: "Water Department", keywords: ["water","leak","pipe","leakage","supply","burst","flood","tap"], baseSeverity: "high" },
  { name: "Sewer Overflow", slug: "sewer-overflow", departmentSlug: "sewer", departmentName: "Sewer Department", keywords: ["sewer","sewage","overflow","drainage","block","clog","backflow"], baseSeverity: "high" },
  { name: "Open Manholes", slug: "open-manholes", departmentSlug: "sewer", departmentName: "Sewer Department", keywords: ["manhole","open","cover","missing","pit","danger"], baseSeverity: "critical" },
  { name: "Construction Debris", slug: "construction-debris", departmentSlug: "waste", departmentName: "Waste Management", keywords: ["debris","construction","rubble","cement","bricks","concrete","site"], baseSeverity: "medium" },
  { name: "Public Property Damage", slug: "public-property-damage", departmentSlug: "road", departmentName: "Road Department", keywords: ["property","damage","bench","fence","bus stop","shelter","vandalism","broken bench"], baseSeverity: "medium" },
  { name: "Fallen Trees", slug: "fallen-trees", departmentSlug: "parks", departmentName: "Parks Department", keywords: ["tree","fallen","branch","uprooted","storm","trunk","wood"], baseSeverity: "high" },
  { name: "Other Civic Issues", slug: "other-civic-issues", departmentSlug: "road", departmentName: "Road Department", keywords: ["other","civic","general","issue"], baseSeverity: "low" },
];

const SEVERITY_PRIORITY: Record<string, "low" | "normal" | "high" | "urgent"> = {
  low: "low",
  medium: "normal",
  high: "high",
  critical: "urgent",
};

function scoreCategory(text: string, cat: CategoryDef): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of cat.keywords) {
    if (lower.includes(kw)) score += 2;
  }
  if (cat.slug === "other-civic-issues" && score === 0) score = 1;
  return score;
}

function detectCategory(text: string): CategoryDef {
  let best: CategoryDef = CATEGORIES[CATEGORIES.length - 1];
  let bestScore = 0;
  for (const cat of CATEGORIES) {
    const s = scoreCategory(text, cat);
    if (s > bestScore) { bestScore = s; best = cat; }
  }
  return best;
}

function estimateSeverity(cat: CategoryDef, text: string): "low" | "medium" | "high" | "critical" {
  const lower = text.toLowerCase();
  let sev = cat.baseSeverity;
  const criticalHints = ["danger","urgent","injury","injured","accident","child","school","blind","deadly","live wire","electrocution","drowning","flood","collapsed"];
  const highHints = ["overflow","flood","major","large","deep","broken","collapsed","blocked","severe","extensive","main road","highway","junction","hospital","market"];
  if (criticalHints.some(h => lower.includes(h))) sev = "critical";
  else if (highHints.some(h => lower.includes(h)) && sev !== "critical") sev = sev === "low" ? "medium" : "high";
  return sev;
}

function buildTitle(cat: CategoryDef, severity: string): string {
  const prefix = severity === "critical" || severity === "high" ? "URGENT: " : "";
  return `${prefix}${cat.name} reported`;
}

function buildDescription(cat: CategoryDef, severity: string, address: string, note: string): string {
  const parts: string[] = [];
  parts.push(`Automated analysis identified this as a ${cat.name.toLowerCase()} issue.`);
  parts.push(`Estimated severity: ${severity.toUpperCase()}. Routing to the ${cat.departmentName}.`);
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
    const note: string = (body.note || "").toString();
    const address: string = (body.address || "").toString();
    const ward: string = (body.ward || "").toString();
    const fileName: string = (body.fileName || "").toString();
    const text = `${note} ${address} ${ward} ${fileName}`;

    const cat = detectCategory(text);
    const severity = estimateSeverity(cat, text);
    const priority = SEVERITY_PRIORITY[severity];

    // Duplicate detection: same category + ward within 200m and 48h.
    let duplicateOf: string | null = null;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    if (body.latitude && body.longitude) {
      const lat = Number(body.latitude);
      const lng = Number(body.longitude);
      const { data: recent } = await supabase
        .from("complaints")
        .select("id, latitude, longitude, created_at")
        .eq("category_slug", cat.slug)
        .gte("created_at", new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString())
        .neq("status", "resolved")
        .neq("status", "rejected")
        .limit(20);
      if (recent && recent.length) {
        for (const r of recent) {
          if (r.latitude == null || r.longitude == null) continue;
          const dLat = Number(r.latitude) - lat;
          const dLng = Number(r.longitude) - lng;
          const distM = Math.sqrt(dLat * dLat + dLng * dLng) * 111000;
          if (distM < 200) { duplicateOf = r.id; break; }
        }
      }
    }

    return new Response(JSON.stringify({
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
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
