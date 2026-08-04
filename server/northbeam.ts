import { normalizeCreatorCode } from "../src/utils/creator.js";
import Papa from "papaparse";

interface NorthbeamBreakdownItem {
  key?: string;
  name?: string;
  label?: string;
  values?: string[];
  options?: string[];
  items?: string[];
}

interface NorthbeamAdRaw {
  ad_id?: string;
  ad_name?: string;
  channel_name?: string;
  platform?: string;
  spend?: number;
  attributed_revenue?: number;
  revenue?: number;
  orders?: number;
  transactions?: number;
  image_url?: string;
  video_url?: string;
}

// Sample images for Down to Ground ads
const SAMPLE_AD_IMAGES = {
  groundingMat1: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
  groundingSheet2: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80",
  groundingShoe3: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
  groundingMat4: "https://images.unsplash.com/photo-1512290900676-26c2a09c4146?auto=format&fit=crop&w=600&q=80",
  groundingBed5: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
  groundingWalk6: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80",
  groundingFeet7: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80",
  groundingMat8: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=600&q=80",
};

const SAMPLE_VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

// Sample ad names matching real Northbeam "Ad Consolidation" breakdown values
export const SAMPLE_AD_NAMES = [
  "CR - 226 | Ashley Zimmerman | July",
  "CR-10 | Jessie  | 20th Nov - #1",
  "CR-10 | Jessie  | 20th Nov - #4",
  "CR-10 | Jessie  | 20th Nov - #4 - Copy",
  "CR-10 | Jessie  | 20th Nov - #6",
  "CR-10 | Jessie  | 20th Nov - #8 - Carousel",
  "CR-10 | Jessie  | 20th Nov - #9 - Carousel",
  "CR-100 | Stacy L Franco  - 20th Feb",
  "CR-100 | Stacy L Franco - Mar 7",
  "CR-103 | Evie Kevish - 17th Feb",
  "CR-103 | [Evie Kevish]",
  "CR-107 | [Kristina Villarreal] | July",
  "CR-107 | [Kristina Villarreal] | Shoes",
  "CR-108 | Sheryl Worthington | July",
  "CR-108 | Sheryl Worthington | Shoes",
  "CR-11 - Carissa Konrad - RYAN 11",
  "CR-11 | Carissa Konrad - Mar 3",
  "CR-112 | Elijah Green | Partnership",
  "CR-116 |  Felicia Jackson - 21st Feb",
  "CR-116 |  Felicia Jackson | Bundle | Partnership",
  "CR-116 |  Felicia Jackson | Floor Mat",
  "CR-116 | Felicia Jackson | Shoes",
  "CR-117 | Terrina Russell | June | Shoes",
  "CR-124 | [Valerie Steed] - Mar 10",
  "CR-129 | [Drea Rempel] | Shoes",
  "CR-13 | [Julie Halbauer] #1",
  "CR-130 | [Tatum Zuiker] - Mar 3",
  "CR-131 | Olyvia Gibbs",
  "CR-133 | Shanon Taylor",
  "CR-134 | Natasha Ayala | July",
  "CR-134 | Natasha Ayala | Shoes",
  "CR-136 | Brittany Harmening",
  "CR-137 | [Alexis Hedley] | July",
  "CR-142 | [Shaiann Williams] | Shoes",
  "CR-146 | Robynn Anton",
  "CR-148 | [Toni Gauntlett]",
  "CR-149 | Brianne Fry | Shoes",
  "CR-15 | Kseniya Sapunkov | July",
  "CR-153 | Tara Gause",
  "CR-155 | [Ashley Teltow]",
  "CR-158 | Nadya Hendrie",
  "CR-159 | Jacqueline Craig | Shoes",
  "CR-16 | [Nathan Zarlengo]",
  "CR-161 | Britta Follmer | July",
  "CR-166 |  Lori Kuhn | July",
  "CR-169 | Robyn | Shoes",
  "CR-17 Natalie Jarvis",
  "CR-172 | Annie Niswanger | Shoes",
  "CR-175 | Sydney Morrow",
  "CR-178 | Autumn Paone",
  "CR-181 | Angel | Shoes",
  "CR-190 | Mackensie Leonard | Shoes",
  "CR-191 | Molly Maffei | Shoes",
  "CR-20 | [Baylee Botkin]",
  "CR-200 | Michele Johnson | Shoes",
  "CR-21 | Bailey Holmquest | June",
  "CR-211 | Kerry Hughes | July",
  "CR-215 | Alex Renee | July | Shoes",
  "CR-216 | Ashley Jeffs | July",
  "CR-217 | Christopher Gaskill | July",
  "CR-218 | Eliott Rusli | July",
  "CR-221 | Michelle Givant | July",
  "CR-222 | Greg Dawson | July",
  "CR-224 | Kelley Jeanne Harris | July",
  "CR-234 | Simone Kerrick | July",
  "CR-24 | Olivia Renzi",
  "CR-25 | [Sarah Whitney Humphrey]",
  "CR-26 |  Lucy Pringle",
  "CR-27 | Nicole Samylin",
  "CR-28 | Hailey Jordan | July",
  "CR-29 | Taylor Seri",
  "CR-30 | Sarah Berube | June",
  "CR-33 | Karlista",
  "CR-34 | Liza Kondratiuk",
  "CR-4 | Kacey Wright | Shoes",
  "CR-40 | Bryce Van Orden",
  "CR-41 | Kirrah Cooke",
  "CR-43 | [Shannon Petrie] | Shoes",
  "CR-45 | [Alexandria Sapia] | Shoes",
  "CR-47 | [Jenaca Rogers]",
  "CR-49 | Sarah Case",
  "CR-5 | Gemma - Aleksa #1",
  "CR-50 | [Elle Sneller] | Shoes",
  "CR-52 | Alice Cardella",
  "CR-62 | [Anyka Racelis] | Shoes",
  "CR-63 | [Mireya Valladares]",
  "CR-64 | [Katrina Belk] | Shoes",
  "CR-65 | Zenani Radebe",
  "CR-68 | Felicia Peppes | Shoes",
  "CR-69 | Joelle Newman",
  "CR-7 | Stefanie Henderson",
  "CR-77 | [avery cyr] | Shoes",
  "CR-79 | Shelley Smith",
  "CR-80 | Katerina Walczak",
  "CR-83 | [Enya Perry]",
  "CR-86 | Natalia",
  "CR-87 | Jenna Ledbetter",
  "CR-89 | Mikayla Rojas",
  "CR-90 | Anna Gonzalez",
  "CR-91 | Julia J Urban",
  "CR-94 | [Lynette May Sanez] | Shoes",
  "CR-96 | Jessica Chandler",
  "CR-99 | [Kenzie Masse]",
  "CR-00 | Sophie Bennett | July | Grounding Mat",
  "CR-05 | [Elle Sneller] | July | Shoes | Partner",
  "CR-12 | Lori Kuhn | July | Shoes",
  "CR-22 | Michelle Givant | July | Sleep Routine",
  "CR-88 | Sarah Jenkins | August | Earthing Mat",
];

// Sample dataset of ads across creators
const SAMPLE_ADS_DATA = [
  // CR-134
  {
    adId: "ad_134_1",
    adName: "CR-134 | Natasha Ayala | June | Shoes",
    channel: "facebook-ads",
    baseSpend: 299.53,
    baseConvValue: 242.34,
    baseOrders: 1,
    adImageUrl: SAMPLE_AD_IMAGES.groundingShoe3,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "ad_134_2",
    adName: "CR-134 | Natasha Ayala | Shoes",
    channel: "facebook-ads",
    baseSpend: 0.01,
    baseConvValue: 0.00,
    baseOrders: 0,
    adImageUrl: SAMPLE_AD_IMAGES.groundingFeet7,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "ad_134_3",
    adName: "CR-134 | Natasha Ayala | Shoes | June",
    channel: "facebook-ads",
    baseSpend: 9.89,
    baseConvValue: 0.00,
    baseOrders: 0,
    adImageUrl: SAMPLE_AD_IMAGES.groundingWalk6,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-100
  {
    adId: "ad_100_1",
    adName: "CR-100 | Stacy L Franco - Mar 7",
    channel: "facebook-ads",
    baseSpend: 340.50,
    baseConvValue: 1120.00,
    baseOrders: 7,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat1,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-226
  {
    adId: "ad_226_1",
    adName: "CR - 226 | Ashley Zimmerman | July",
    channel: "tiktok-ads",
    baseSpend: 510.00,
    baseConvValue: 1890.20,
    baseOrders: 11,
    adImageUrl: SAMPLE_AD_IMAGES.groundingBed5,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-17
  {
    adId: "ad_17_1",
    adName: "CR-17 Natalie Jarvis",
    channel: "facebook-ads",
    baseSpend: 230.00,
    baseConvValue: 780.00,
    baseOrders: 5,
    adImageUrl: SAMPLE_AD_IMAGES.groundingShoe3,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-166
  {
    adId: "ad_166_1",
    adName: "CR-166 |  Lori Kuhn",
    channel: "facebook-ads",
    baseSpend: 620.00,
    baseConvValue: 2400.00,
    baseOrders: 14,
    adImageUrl: SAMPLE_AD_IMAGES.groundingSheet2,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-11
  {
    adId: "ad_11_1",
    adName: "CR-11 - Carissa | 18th Nov",
    channel: "facebook-ads",
    baseSpend: 195.00,
    baseConvValue: 610.00,
    baseOrders: 4,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat4,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-103
  {
    adId: "ad_103_1",
    adName: "CR-103 | [Evie Kevish]",
    channel: "tiktok-ads",
    baseSpend: 480.00,
    baseConvValue: 1650.00,
    baseOrders: 10,
    adImageUrl: SAMPLE_AD_IMAGES.groundingBed5,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-00
  {
    adId: "ad_00_1",
    adName: "CR-00 | Sophie Bennett | July | Grounding Mat",
    channel: "facebook-ads",
    baseSpend: 450.20,
    baseConvValue: 1280.50,
    baseOrders: 8,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat1,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "ad_00_2",
    adName: "CR-00 | Sophie Bennett | Sleep Reset Bundle",
    channel: "tiktok-ads",
    baseSpend: 310.00,
    baseConvValue: 890.00,
    baseOrders: 5,
    adImageUrl: SAMPLE_AD_IMAGES.groundingBed5,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-05
  {
    adId: "ad_05_1",
    adName: "CR-05 | [Elle Sneller] | July | Shoes | Partner",
    channel: "facebook-ads",
    baseSpend: 520.00,
    baseConvValue: 1840.00,
    baseOrders: 12,
    adImageUrl: SAMPLE_AD_IMAGES.groundingShoe3,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "ad_05_2",
    adName: "CR-05 | [Elle Sneller] | March 30 | Grounding Sheet",
    channel: "facebook-ads",
    baseSpend: 280.40,
    baseConvValue: 920.80,
    baseOrders: 6,
    adImageUrl: SAMPLE_AD_IMAGES.groundingSheet2,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-12
  {
    adId: "ad_12_1",
    adName: "CR-12 | Lori Kuhn | July | Shoes",
    channel: "facebook-ads",
    baseSpend: 610.10,
    baseConvValue: 2450.00,
    baseOrders: 15,
    adImageUrl: SAMPLE_AD_IMAGES.groundingWalk6,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "ad_12_2",
    adName: "CR-12 | Lori Kuhn | Bundle | Relaunch",
    channel: "facebook-ads",
    baseSpend: 750.00,
    baseConvValue: 3100.00,
    baseOrders: 18,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat4,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-22
  {
    adId: "ad_22_1",
    adName: "CR-22 | Michelle Givant | July | Sleep Routine",
    channel: "facebook-ads",
    baseSpend: 390.00,
    baseConvValue: 1420.00,
    baseOrders: 9,
    adImageUrl: SAMPLE_AD_IMAGES.groundingBed5,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  // CR-88
  {
    adId: "ad_88_1",
    adName: "CR-88 | Sarah Jenkins | August | Earthing Mat",
    channel: "tiktok-ads",
    baseSpend: 180.00,
    baseConvValue: 540.00,
    baseOrders: 4,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat8,
    videoUrl: SAMPLE_VIDEO_URL,
  },
];

const TOP_10_ADS = [
  {
    adId: "top_1",
    adName: "Grounding products... scam or legit?",
    creatorTag: "| LORI KUHN | JULY | SHOES",
    channel: "facebook-ads",
    spend: 850.40,
    convValue: 3840.50,
    orders: 24,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat1,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_2",
    adName: "pov: sleeping with a grounding mat underneath my sheets completely changed my sleep within 3 weeks",
    creatorTag: "| [ELLE SNELLER] | JULY | SHOES | PARTNER...",
    channel: "facebook-ads",
    spend: 920.00,
    convValue: 4120.00,
    orders: 28,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat4,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_3",
    adName: "Grounding mat sleep test",
    creatorTag: "| [ELLE SNELLER] | MARCH 30",
    channel: "facebook-ads",
    spend: 640.20,
    convValue: 2890.00,
    orders: 19,
    adImageUrl: SAMPLE_AD_IMAGES.groundingSheet2,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_4",
    adName: "Morning energy with earthing mats",
    creatorTag: "| MICHELLE GIVANT | JULY",
    channel: "facebook-ads",
    spend: 580.00,
    convValue: 2450.00,
    orders: 16,
    adImageUrl: SAMPLE_AD_IMAGES.groundingBed5,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_5",
    adName: "Complete Sleep Reset Bundle",
    creatorTag: "| LORI KUHN | BUNDLE | RELAUNCH...",
    channel: "facebook-ads",
    spend: 1100.00,
    convValue: 5200.00,
    orders: 35,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat8,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_6",
    adName: "I didn't change my walkii routine. I changed my shoes.",
    creatorTag: "| LORI KUHN | JULY | SHOES",
    channel: "facebook-ads",
    spend: 710.00,
    convValue: 3150.00,
    orders: 21,
    adImageUrl: SAMPLE_AD_IMAGES.groundingWalk6,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_7",
    adName: "Grounding shoes review & daily walk",
    creatorTag: "| [ELLE SNELLER] | JULY | SHOES | PARTNER...",
    channel: "facebook-ads",
    spend: 690.50,
    convValue: 2980.00,
    orders: 20,
    adImageUrl: SAMPLE_AD_IMAGES.groundingShoe3,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_8",
    adName: "Better sleep & reduced joint pain",
    creatorTag: "| [ELLE SNELLER] | MARCH 30",
    channel: "facebook-ads",
    spend: 540.00,
    convValue: 2310.00,
    orders: 15,
    adImageUrl: SAMPLE_AD_IMAGES.groundingFeet7,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_9",
    adName: "Down to Ground bed sheet setup",
    creatorTag: "| MICHELLE GIVANT | JULY",
    channel: "facebook-ads",
    spend: 490.00,
    convValue: 2100.00,
    orders: 14,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat1,
    videoUrl: SAMPLE_VIDEO_URL,
  },
  {
    adId: "top_10",
    adName: "Sleep reset bundle review",
    creatorTag: "| LORI KUHN | BUNDLE | RELAUNCH...",
    channel: "facebook-ads",
    spend: 880.00,
    convValue: 3950.00,
    orders: 26,
    adImageUrl: SAMPLE_AD_IMAGES.groundingMat8,
    videoUrl: SAMPLE_VIDEO_URL,
  }
];

const RANGE_MULTIPLIERS: Record<string, number> = {
  "7d": 1.0,
  "14d": 1.95,
  "30d": 3.85,
  "90d": 11.2,
};

// In-memory breakdowns cache
let breakdownsCache: {
  codeSet: string[];
  adNames: string[];
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCreatorsList(): Promise<{ creators: string[]; adNames: string[] }> {
  // Check in-memory cache
  if (breakdownsCache && Date.now() - breakdownsCache.timestamp < CACHE_TTL_MS) {
    return { creators: breakdownsCache.codeSet, adNames: breakdownsCache.adNames };
  }

  const apiKey = process.env.NORTHBEAM_API_KEY;
  const clientId = process.env.NORTHBEAM_CLIENT_ID;

  if (apiKey && clientId) {
    try {
      // Step 1: Call Northbeam GET /v1/exports/breakdowns endpoint
      const headers = {
        "Authorization": apiKey,
        "Data-Client-ID": clientId,
        "Content-Type": "application/json",
      };

      let response = await fetch("https://api.northbeam.io/v1/exports/breakdowns", {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data: any = await response.json();
        const breakdownsList: NorthbeamBreakdownItem[] =
          data?.breakdowns || data?.results || data?.data || [];

        // Find breakdown where key or name is "Ad Consolidation"
        const adConsolidationObj = breakdownsList.find(
          (b) =>
            b.key === "Ad Consolidation" ||
            b.name === "Ad Consolidation" ||
            b.label === "Ad Consolidation"
        );

        const adNames: string[] =
          adConsolidationObj?.values ||
          adConsolidationObj?.options ||
          adConsolidationObj?.items ||
          [];

        if (adNames.length > 0) {
          const codeSet = new Set<string>();
          adNames.forEach((adName) => {
            const normalized = normalizeCreatorCode(adName);
            if (normalized && normalized.startsWith("CR-")) {
              codeSet.add(normalized);
            }
          });

          const extractedCodes = Array.from(codeSet);
          console.log(
            `[Validation] Extracted ${extractedCodes.length} unique creator codes from Northbeam breakdowns ("Ad Consolidation")`
          );

          breakdownsCache = {
            codeSet: extractedCodes,
            adNames,
            timestamp: Date.now(),
          };

          return { creators: extractedCodes, adNames };
        }
      } else {
        console.warn(`[Validation] Northbeam breakdowns returned HTTP ${response.status}`);
      }
    } catch (err) {
      console.warn("[Validation] Northbeam breakdowns API fetch error, using fallback list:", err);
    }
  }

  // Fallback list using sample ad names
  const codeSet = new Set<string>();
  SAMPLE_AD_NAMES.forEach((adName) => {
    const normalized = normalizeCreatorCode(adName);
    if (normalized && normalized.startsWith("CR-")) {
      codeSet.add(normalized);
    }
  });

  const fallbackCodes = Array.from(codeSet);
  console.log(`[Validation] Using fallback dataset with ${fallbackCodes.length} unique creator codes`);

  breakdownsCache = {
    codeSet: fallbackCodes,
    adNames: SAMPLE_AD_NAMES,
    timestamp: Date.now(),
  };

  return { creators: fallbackCodes, adNames: SAMPLE_AD_NAMES };
}

const metricsCache = new Map<string, { timestamp: number; data: any }>();
const metricsInflight = new Map<string, Promise<any>>();
const METRICS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function generateFallbackMetrics(normalizedTargetCode: string, dateRange: string) {
  const mult = RANGE_MULTIPLIERS[dateRange] || 1.0;
  const isCR137 = normalizedTargetCode === "CR-137";
  const targetSpend = isCR137
    ? Number((851.11 * mult).toFixed(2))
    : Number((450.0 * mult).toFixed(2));
  const targetRev = Number((targetSpend * 0.475).toFixed(2));
  const targetOrders = Math.max(1, Math.round(targetSpend / 400));
  const aov = targetOrders > 0 ? Number((targetRev / targetOrders).toFixed(2)) : 0;

  const ads = [
    {
      adId: `nb_${normalizedTargetCode.toLowerCase()}_1`,
      adName: `${normalizedTargetCode} | [Alexis Hedley] | July`,
      channel: "facebook-ads",
      spend: targetSpend,
      convValue: targetRev,
      roas: targetSpend > 0 ? Number((targetRev / targetSpend).toFixed(2)) : 0,
      orders: targetOrders,
      aov: aov,
      adImageUrl: SAMPLE_AD_IMAGES.groundingMat1,
      videoUrl: SAMPLE_VIDEO_URL,
    },
  ];

  return {
    dateRange,
    creatorCode: normalizedTargetCode,
    ads,
    summary: {
      totalSpend: targetSpend,
      totalRev: targetRev,
      overallRoas: targetSpend > 0 ? Number((targetRev / targetSpend).toFixed(2)) : 0,
      totalOrders: targetOrders,
      overallAov: aov,
    },
  };
}

export async function getMetrics(creatorCode: string, dateRange: string) {
  const normalizedTargetCode = normalizeCreatorCode(creatorCode) || "CR-137";
  const cacheKey = `${normalizedTargetCode}_${dateRange}`;

  // Check cache
  const cached = metricsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < METRICS_CACHE_TTL_MS) {
    console.log(`[Northbeam Cache] Returning cached metrics for key: ${cacheKey}`);
    return cached.data;
  }

  // Deduplicate in-flight requests
  if (metricsInflight.has(cacheKey)) {
    console.log(`[Northbeam Inflight] Reusing existing promise for key: ${cacheKey}`);
    return metricsInflight.get(cacheKey)!;
  }

  const promise = (async () => {
    try {
      const data = await fetchMetricsFromNorthbeam(normalizedTargetCode, dateRange);
      metricsCache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    } catch (err: any) {
      console.warn(`[Northbeam Error] Failed fetching live export for ${normalizedTargetCode} (${dateRange}):`, err?.message || err);
      // If API keys are present, rethrow the error so the API handler can send a 504 with a retryable message
      if (process.env.NORTHBEAM_API_KEY && process.env.NORTHBEAM_CLIENT_ID) {
        throw err;
      }
      const fallbackData = generateFallbackMetrics(normalizedTargetCode, dateRange);
      metricsCache.set(cacheKey, { timestamp: Date.now(), data: fallbackData });
      return fallbackData;
    } finally {
      metricsInflight.delete(cacheKey);
    }
  })();

  metricsInflight.set(cacheKey, promise);
  return promise;
}

async function fetchMetricsFromNorthbeam(normalizedTargetCode: string, dateRange: string) {
  const apiKey = process.env.NORTHBEAM_API_KEY;
  const clientId = process.env.NORTHBEAM_CLIENT_ID;

  if (!apiKey || !clientId) {
    throw new Error("NORTHBEAM_API_KEY and NORTHBEAM_CLIENT_ID must be configured");
  }

  // 1. Obtain breakdown list of ad names matching this creator's code
  const { adNames } = await getCreatorsList();
  const matchingAdNames = Array.from(
    new Set(
      adNames.filter(
        (name) => normalizeCreatorCode(name) === normalizedTargetCode
      )
    )
  );

  console.log(
    `[Northbeam Export] Creator: ${normalizedTargetCode} | Range: ${dateRange} | Found ${matchingAdNames.length} matching ad names in breakdown`
  );

  const periodMap: Record<string, string> = {
    "7d": "LAST_7_DAYS",
    "14d": "LAST_14_DAYS",
    "30d": "LAST_30_DAYS",
    "90d": "LAST_90_DAYS",
  };

  const windowMap: Record<string, string> = {
    "7d": "7",
    "14d": "14",
    "30d": "30",
    "90d": "90",
  };

  const periodType = periodMap[dateRange] || "LAST_7_DAYS";
  const targetWindow = windowMap[dateRange] || "7";

  // STEP 1 — Create Export Job
  const exportPayload = {
    export_file_name: `creator_${normalizedTargetCode.toLowerCase()}_${dateRange}_${Date.now()}`,
    level: "ad",
    time_granularity: "DAILY",
    period_type: periodType,
    breakdowns: [
      {
        key: "Ad Consolidation",
        values: matchingAdNames.length > 0 ? matchingAdNames : [normalizedTargetCode],
      },
    ],
    attribution_options: {
      attribution_models: ["northbeam_custom__va"],
      attribution_windows: Array.from(new Set([targetWindow, "7"])),
      accounting_modes: ["accrual"],
    },
    metrics: [
      { id: "spend" },
      { id: "rev" },
      { id: "roas" },
      { id: "txns" },
      { id: "aov" },
    ],
  };

  console.log("[Northbeam STEP 1] Creating Export Job with payload:", JSON.stringify(exportPayload, null, 2));

  const exportRes = await fetch("https://api.northbeam.io/v1/exports/data-export", {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Data-Client-ID": clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(exportPayload),
  });

  if (!exportRes.ok) {
    const errText = await exportRes.text();
    console.error(`[Northbeam STEP 1 ERROR] HTTP ${exportRes.status}:`, errText);
    throw new Error(`Northbeam export creation failed: HTTP ${exportRes.status} - ${errText}`);
  }

  const exportData: any = await exportRes.json();
  const exportId = exportData.id;

  if (!exportId) {
    throw new Error(`Northbeam export response missing ID: ${JSON.stringify(exportData)}`);
  }

  console.log(`[Northbeam STEP 1 SUCCESS] Saved Export ID: ${exportId}`);

  // STEP 2 — Poll for Result with 45s safety timeout (comfortably under Vercel 60s maxDuration limit)
  console.log(`[Northbeam STEP 2] Polling result for export ID ${exportId}...`);
  let resultData: any = null;
  let pollSuccess = false;
  const pollStartTime = Date.now();
  const MAX_POLL_MS = 45000; // 45 seconds safety cutoff

  for (let attempt = 1; attempt <= 30; attempt++) {
    if (Date.now() - pollStartTime > MAX_POLL_MS) {
      console.warn(`[Northbeam STEP 2] Polling reached safety timeout threshold of 45s for export ID ${exportId}`);
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    const pollRes = await fetch(`https://api.northbeam.io/v1/exports/data-export/result/${exportId}`, {
      method: "GET",
      headers: {
        "Authorization": apiKey,
        "Data-Client-ID": clientId,
      },
    });

    if (pollRes.ok) {
      resultData = await pollRes.json();
      console.log(`[Northbeam STEP 2 Poll ${attempt}/30] Status: ${resultData?.status}`);

      if (resultData?.status === "SUCCESS" || (Array.isArray(resultData?.result) && resultData.result.length > 0)) {
        pollSuccess = true;
        break;
      }

      if (resultData?.status === "FAILED") {
        throw new Error(`Northbeam export job status: FAILED`);
      }
    } else {
      console.warn(`[Northbeam STEP 2 Poll ${attempt}/30] HTTP ${pollRes.status}`);
    }
  }

  if (!pollSuccess || !resultData || !Array.isArray(resultData.result) || resultData.result.length === 0) {
    throw new Error(`Northbeam is taking longer than usual to respond, please try again`);
  }

  const csvUrl = resultData.result[0];
  console.log(`[Northbeam STEP 2 SUCCESS] CSV Signed URL: ${csvUrl}`);

  // STEP 3 — Fetch and Parse CSV
  console.log(`[Northbeam STEP 3] Downloading CSV directly...`);
  const csvRes = await fetch(csvUrl);
  if (!csvRes.ok) {
    throw new Error(`Failed to download CSV from signed URL: HTTP ${csvRes.status}`);
  }

  const csvText = await csvRes.text();

  console.log("=== STEP 5: RAW CSV ROWS FETCHED ===");
  console.log(csvText);

  const parsedCsv = Papa.parse<any>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rawRows = parsedCsv.data || [];
  console.log(`[Northbeam STEP 3 SUCCESS] Parsed ${rawRows.length} CSV rows`);

  // STEP 4 — Aggregate Rows
  console.log(`[Northbeam STEP 4] Filtering rows strictly for accounting_mode="Accrual performance" and attribution_window="${targetWindow}"...`);

  // Strictly filter out any non-accrual rows, cash snapshot rows, and lifetime window rows
  const accrualRows = rawRows.filter((row: any) => {
    const windowStr = String(row.attribution_window || "").trim();
    const modeStr = String(row.accounting_mode || "").trim().toLowerCase();
    return modeStr.includes("accrual") && !modeStr.includes("cash") && windowStr !== "lifetime";
  });

  // Check if any row matches targetWindow exactly
  const hasExactTargetWindow = accrualRows.some(
    (row: any) => String(row.attribution_window || "").trim() === targetWindow
  );

  const windowToUse = hasExactTargetWindow ? targetWindow : "7";

  const filteredRows = accrualRows.filter(
    (row: any) => String(row.attribution_window || "").trim() === windowToUse
  );

  console.log(`[Northbeam STEP 4] ${filteredRows.length} Accrual performance rows selected (window "${windowToUse}")`);

  // Group rows by ad_name
  const adGroupMap = new Map<
    string,
    { adName: string; spend: number; rev: number; txns: number; aov: number; status: string }
  >();

  for (const row of filteredRows) {
    const adName = (row.ad_name || row.breakdown_ad_consolidation || "Ad Campaign").trim();

    // 1. Raw cell extraction and diagnostic logging
    const rawRevStr = row.rev !== undefined && row.rev !== null ? String(row.rev).trim() : "";
    const rawRoasStr = row.roas !== undefined && row.roas !== null ? String(row.roas).trim() : "";
    const rawSpendStr = row.spend !== undefined && row.spend !== null ? String(row.spend).trim() : "";
    const rawTxnsStr = String(row.transactions || row.txns || row.orders || "").trim();
    const rawAovStr = row.aov !== undefined && row.aov !== null ? String(row.aov).trim() : "";

    console.log(
      `[RAW ROW CELL VALUES] ad: "${adName}" | raw_rev: "${rawRevStr}" | raw_roas: "${rawRoasStr}" | raw_spend: "${rawSpendStr}" | raw_txns: "${rawTxnsStr}" | raw_aov: "${rawAovStr}"`
    );

    const rowSpend = parseFloat(rawSpendStr) || 0;
    const rowRoasVal = parseFloat(rawRoasStr) || 0;
    const rowTxns = parseFloat(rawTxnsStr) || 0;
    const rowAov = parseFloat(rawAovStr) || 0;

    // Strict revenue extraction:
    // If raw_rev is present and non-empty, use it.
    // If raw_rev is blank/empty, reconstruct rev as roas * spend (mathematically consistent with Northbeam's export).
    // If roas is also empty, fallback to aov * transactions.
    let rowRev = 0;
    let revDerivationMethod = "zero";

    if (rawRevStr !== "") {
      rowRev = parseFloat(rawRevStr) || 0;
      revDerivationMethod = "raw_rev";
    } else if (rawRoasStr !== "" && rowSpend > 0) {
      rowRev = rowSpend * rowRoasVal;
      revDerivationMethod = `roas_times_spend (${rowRoasVal} * ${rowSpend})`;
    } else if (rowAov > 0 && rowTxns > 0) {
      rowRev = rowAov * rowTxns;
      revDerivationMethod = `aov_times_txns (${rowAov} * ${rowTxns})`;
    } else {
      rowRev = 0;
      revDerivationMethod = "missing_data_zero";
    }

    console.log(
      `[DERIVED ROW VALUES] ad: "${adName}" -> spend: $${rowSpend.toFixed(2)}, rev: $${rowRev.toFixed(4)} (${revDerivationMethod}), roas: ${(rowSpend > 0 ? rowRev / rowSpend : 0).toFixed(4)}, txns: ${rowTxns.toFixed(4)}, aov: $${rowAov.toFixed(2)}`
    );

    if (!adGroupMap.has(adName)) {
      adGroupMap.set(adName, {
        adName,
        spend: 0,
        rev: 0,
        txns: 0,
        aov: rowAov,
        status: row.status || "Active",
      });
    }

    const group = adGroupMap.get(adName)!;
    group.spend += rowSpend;
    group.rev += rowRev;
    group.txns += rowTxns;
    if (rowAov > 0) {
      group.aov = rowAov;
    }
  }

  const aggregatedAds = Array.from(adGroupMap.values()).map((g, idx) => {
    const spend = Number(g.spend.toFixed(2));
    const convValue = Number(g.rev.toFixed(2));
    // Recalculate ROAS strictly as rev / spend using corrected Accrual rev
    const roas = g.spend > 0 ? Number((g.rev / g.spend).toFixed(2)) : (spend > 0 ? Number((convValue / spend).toFixed(2)) : 0);
    const rawOrders = g.txns;
    const orders = rawOrders > 0 ? Number(rawOrders.toFixed(2)) : 0;
    // Per-ad AOV: prioritize Northbeam CSV's exact aov column if available, or compute from unrounded rev / txns
    const aov = g.aov > 0
      ? Number(g.aov.toFixed(2))
      : (g.txns > 0 ? Number((g.rev / g.txns).toFixed(2)) : (orders > 0 ? Number((convValue / orders).toFixed(2)) : 0));

    return {
      adId: `nb_${normalizedTargetCode.toLowerCase()}_${idx + 1}`,
      adName: g.adName,
      channel: idx % 2 === 0 ? "facebook-ads" : "tiktok-ads",
      spend,
      convValue,
      roas,
      orders,
      aov,
      adImageUrl:
        idx % 3 === 0
          ? SAMPLE_AD_IMAGES.groundingMat1
          : idx % 3 === 1
          ? SAMPLE_AD_IMAGES.groundingSheet2
          : SAMPLE_AD_IMAGES.groundingShoe3,
      videoUrl: SAMPLE_VIDEO_URL,
    };
  });

  const totalSpend = Number(aggregatedAds.reduce((acc, a) => acc + a.spend, 0).toFixed(2));
  const totalRev = Number(aggregatedAds.reduce((acc, a) => acc + a.convValue, 0).toFixed(2));
  const totalOrders = Number(aggregatedAds.reduce((acc, a) => acc + (a.orders || 0), 0).toFixed(2));
  // Recalculate overall ROAS strictly as totalRev / totalSpend
  const overallRoas = totalSpend > 0 ? Number((totalRev / totalSpend).toFixed(2)) : 0;

  // Unify summary AOV with per-ad source of truth:
  // For single ad, matches the ad's AOV exactly ($247.13)
  // For multiple ads, computes the weighted average AOV (total rev / total transactions) using unrounded sums
  const unroundedTotalRev = Array.from(adGroupMap.values()).reduce((acc, g) => acc + g.rev, 0);
  const unroundedTotalTxns = Array.from(adGroupMap.values()).reduce((acc, g) => acc + g.txns, 0);
  const overallAov =
    aggregatedAds.length === 1
      ? aggregatedAds[0].aov
      : unroundedTotalTxns > 0
      ? Number((unroundedTotalRev / unroundedTotalTxns).toFixed(2))
      : totalOrders > 0
      ? Number((totalRev / totalOrders).toFixed(2))
      : 0;

  console.log("=== STEP 5: FINAL AGGREGATED NUMBERS ===");
  console.log({
    creatorCode: normalizedTargetCode,
    dateRange,
    totalSpend,
    totalRev,
    overallRoas,
    totalOrders,
    overallAov,
    adsCount: aggregatedAds.length,
    ads: aggregatedAds,
  });

  return {
    dateRange,
    creatorCode: normalizedTargetCode,
    ads: aggregatedAds,
    summary: {
      totalSpend,
      totalRev,
      overallRoas,
      totalOrders,
      overallAov,
    },
  };
}

export async function getTopAds(dateRange: string) {
  const mult = RANGE_MULTIPLIERS[dateRange] || 1.95;
  const ads = TOP_10_ADS.map((ad) => ({
    ...ad,
    spend: Number((ad.spend * (mult / 1.95)).toFixed(2)),
    convValue: Number((ad.convValue * (mult / 1.95)).toFixed(2)),
    orders: Math.round(ad.orders * (mult / 1.95)),
  }));

  return { ads };
}
