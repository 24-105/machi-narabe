import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const TABLE_NAME = "machi_scores";
const SELECT_COLUMNS = "id,random_name,score,max_level,max_chain,turns,created_at";
const RANKING_LIMIT = 10;
const MAX_SCORE = 999999999;
const MAX_LEVEL = 5;
const MAX_CHAIN = 99;
const MAX_TURNS = 999;
const PLAYER_NAME_RE = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}々ー]{2,16}$/u;

type ScorePayload = {
  randomName?: unknown;
  random_name?: unknown;
  score?: unknown;
  maxLevel?: unknown;
  max_level?: unknown;
  maxChain?: unknown;
  max_chain?: unknown;
  turns?: unknown;
};

type ScoreRow = {
  id: number;
  random_name: string;
  score: number;
  max_level: number;
  max_chain: number;
  turns: number;
  created_at: string;
};

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const supabaseUrl = Deno.env.get("MACHI_DB_URL");
const serviceRoleKey = Deno.env.get("MACHI_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("MACHI_DB_URL and MACHI_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin");
  const corsHeaders = buildCorsHeaders(origin);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!isAllowedOrigin(origin)) {
    return jsonResponse({ error: "forbidden_origin" }, 403, corsHeaders);
  }

  try {
    if (request.method === "GET") {
      return jsonResponse(await buildRankingResponse(), 200, corsHeaders);
    }

    if (request.method === "POST") {
      const payload = await readJson(request);
      const row = normalizeScorePayload(payload);
      const { data, error } = await supabase.from(TABLE_NAME).insert(row).select(SELECT_COLUMNS).single();

      if (error) {
        console.error("failed to insert machi score", error.message);
        throw new HttpError(500, "score_insert_failed");
      }

      const savedRecord = data as ScoreRow;
      const rank = await getRecordRank(savedRecord);
      return jsonResponse(
        {
          ok: true,
          record: serializeScore(savedRecord, rank),
          ...(await buildRankingResponse()),
        },
        201,
        corsHeaders,
      );
    }

    return jsonResponse({ error: "method_not_allowed" }, 405, corsHeaders);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status, corsHeaders);
    }

    console.error("machi ranking function error", error);
    return jsonResponse({ error: "internal_error" }, 500, corsHeaders);
  }
});

async function buildRankingResponse() {
  const overall = await getOverallTop10();
  return {
    overall,
    ranking: overall,
  };
}

async function getOverallTop10() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(SELECT_COLUMNS)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(RANKING_LIMIT);

  if (error) {
    console.error("failed to load machi ranking", error.message);
    throw new HttpError(500, "ranking_load_failed");
  }

  return (data ?? []).map((record, index) => serializeScore(record as ScoreRow, index + 1));
}

async function getRecordRank(record: ScoreRow) {
  const { data, error } = await supabase.rpc("machi_score_rank", {
    p_score: record.score,
    p_created_at: record.created_at,
    p_id: record.id,
  });

  if (error) {
    console.error("failed to calculate machi rank", error.message);
    return null;
  }

  return Number.isInteger(data) ? data : null;
}

function normalizeScorePayload(payload: ScorePayload) {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "invalid_payload");
  }

  const randomName = readString(payload.randomName ?? payload.random_name, "random_name").trim();
  if (!PLAYER_NAME_RE.test(randomName)) {
    throw new HttpError(400, "invalid_random_name");
  }

  return {
    random_name: randomName,
    score: readInteger(payload.score, "score", 0, MAX_SCORE),
    max_level: readInteger(payload.maxLevel ?? payload.max_level, "max_level", 1, MAX_LEVEL),
    max_chain: readInteger(payload.maxChain ?? payload.max_chain, "max_chain", 0, MAX_CHAIN),
    turns: readInteger(payload.turns, "turns", 0, MAX_TURNS),
  };
}

function serializeScore(record: ScoreRow, rank: number | null = null) {
  return {
    randomName: record.random_name,
    score: record.score,
    maxLevel: record.max_level,
    maxChain: record.max_chain,
    turns: record.turns,
    createdAt: record.created_at,
    rank,
  };
}

async function readJson(request: Request): Promise<ScorePayload> {
  try {
    return (await request.json()) as ScorePayload;
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

function readString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpError(400, `invalid_${fieldName}`);
  }

  return value;
}

function readInteger(value: unknown, fieldName: string, min: number, max: number): number {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  if (!Number.isInteger(number) || number < min || number > max) {
    throw new HttpError(400, `invalid_${fieldName}`);
  }

  return number;
}

function buildCorsHeaders(origin: string | null) {
  const allowOrigin = getCorsOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function isAllowedOrigin(origin: string | null) {
  const allowedOrigins = getConfiguredOrigins();
  return !origin || allowedOrigins.length === 0 || allowedOrigins.includes("*") || allowedOrigins.includes(origin);
}

function getCorsOrigin(origin: string | null) {
  const allowedOrigins = getConfiguredOrigins();
  if (allowedOrigins.length === 0 || allowedOrigins.includes("*")) return "*";
  if (origin && allowedOrigins.includes(origin)) return origin;
  return allowedOrigins[0];
}

function getConfiguredOrigins() {
  return (Deno.env.get("APP_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function jsonResponse(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
