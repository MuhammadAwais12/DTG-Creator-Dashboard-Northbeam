import { AdMetric, DateRange, KpiMetrics, TopAdMetric } from "../types";
import { normalizeCreatorCode } from "../utils/creator";

export async function fetchCreatorCodes(): Promise<string[]> {
  try {
    const res = await fetch("/api/northbeam/creators");
    if (!res.ok) {
      throw new Error("Failed to fetch creator codes");
    }
    const data = await res.json();
    const rawCodes: string[] = data.creators || [];
    const normalizedCodes = rawCodes.map((c) => normalizeCreatorCode(c));
    console.log("[Northbeam Breakdown API] Loaded active creator codes:", normalizedCodes);
    return normalizedCodes;
  } catch (error) {
    console.error("Error fetching creator codes:", error);
    throw error;
  }
}

export async function validateCreatorCode(
  code: string,
  cachedCodes: string[] = []
): Promise<{ isValid: boolean; normalizedCode: string }> {
  const normalizedInput = normalizeCreatorCode(code);
  console.log(`[Validation Request] Code entered: "${code}" | Normalized: "${normalizedInput}"`);

  try {
    const res = await fetch(`/api/northbeam/creators?code=${encodeURIComponent(code)}`);
    if (res.ok) {
      const data = await res.json();
      console.log("[Validation API Response]:", data);
      if (typeof data.isValid === "boolean") {
        return {
          isValid: data.isValid,
          normalizedCode: data.normalizedCode || normalizedInput,
        };
      }
      const creators: string[] = (data.creators || []).map((c: string) => normalizeCreatorCode(c));
      const isValid = creators.includes(normalizedInput);
      return { isValid, normalizedCode: normalizedInput };
    }
  } catch (err) {
    console.warn("Server validation request failed, checking client cache:", err);
  }

  // Fallback check against cachedCodes if server request failed
  const normalizedCached = cachedCodes.map((c) => normalizeCreatorCode(c));
  const isValid = normalizedCached.length === 0 || normalizedCached.includes(normalizedInput);
  console.log(`[Fallback Validation] Client cache check: ${isValid}`);
  return { isValid, normalizedCode: normalizedInput };
}

export async function fetchCreatorMetrics(
  creatorCode: string,
  dateRange: DateRange
): Promise<{ ads: AdMetric[]; kpis: KpiMetrics }> {
  const normalizedCode = normalizeCreatorCode(creatorCode);
  try {
    const res = await fetch(
      `/api/northbeam/metrics?creatorCode=${encodeURIComponent(
        normalizedCode
      )}&dateRange=${encodeURIComponent(dateRange)}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch creator metrics");
    }

    const data = await res.json();
    const rawAds = data.ads || [];

    const summary = data.summary || {};
    let totalSpend = 0;
    let totalConvValue = 0;
    let totalOrders = 0;

    const ads: AdMetric[] = rawAds.map((ad: any) => {
      const spend = Number(ad.spend || 0);
      const convValue = Number(ad.convValue || 0);
      const orders = Number(ad.orders || 0);

      totalSpend += spend;
      totalConvValue += convValue;
      totalOrders += orders;

      const roas = typeof ad.roas === "number" ? ad.roas : (spend > 0 ? convValue / spend : 0);
      const aov = typeof ad.aov === "number" && ad.aov > 0 ? ad.aov : (orders > 0 ? convValue / orders : 0);
      const estCommission = convValue * 0.10;

      return {
        ...ad,
        spend,
        convValue,
        orders,
        roas,
        aov,
        estCommission,
      };
    });

    const overallRoas =
      typeof summary.overallRoas === "number"
        ? summary.overallRoas
        : totalSpend > 0
        ? totalConvValue / totalSpend
        : 0;

    const overallAov =
      typeof summary.overallAov === "number" && summary.overallAov > 0
        ? summary.overallAov
        : totalOrders > 0
        ? totalConvValue / totalOrders
        : 0;

    const overallCommission = totalConvValue * 0.10;

    const kpis: KpiMetrics = {
      totalSpend: typeof summary.totalSpend === "number" ? summary.totalSpend : totalSpend,
      convValue: typeof summary.totalRev === "number" ? summary.totalRev : totalConvValue,
      roas: overallRoas,
      aov: overallAov,
      estCommission: overallCommission,
      totalOrders: typeof summary.totalOrders === "number" ? summary.totalOrders : totalOrders,
    };

    return { ads, kpis };
  } catch (error) {
    console.error("Error fetching creator metrics:", error);
    throw error;
  }
}

export async function fetchTopAds(dateRange: DateRange = "14d"): Promise<TopAdMetric[]> {
  try {
    const res = await fetch(`/api/northbeam/top-ads?dateRange=${encodeURIComponent(dateRange)}`);
    if (!res.ok) {
      throw new Error("Failed to fetch top ads");
    }
    const data = await res.json();
    return (data.ads || []).map((ad: any) => ({
      ...ad,
      roas: ad.spend > 0 ? ad.convValue / ad.spend : 0,
      aov: ad.orders > 0 ? ad.convValue / ad.orders : 0,
      estCommission: ad.convValue * 0.10,
    }));
  } catch (error) {
    console.error("Error fetching top ads:", error);
    return [];
  }
}
