import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StudentResult } from "./types";
import { generateTeletalkHtml } from "./teletalk-formatter";
import { APP_CONFIG } from "./config";

let supabaseClient: SupabaseClient | null = null;

// In-memory persistent cache/fallback for instant local testing and fallback when credentials are not yet added
const memoryStore: Map<string, StudentResult> = new Map();

// Initialize sample student record for instant testing in Dhaka board
const defaultSample: StudentResult = {
  id: "sample-1",
  exam: "ssc",
  year: "2024",
  board: "dhaka",
  roll: "123456",
  reg: "1234567890",
  name: "MD. RAHIM MIAH",
  father_name: "MD. ABDUL KARIM",
  mother_name: "RAHIMA BEGUM",
  group: "SCIENCE",
  type: "REGULAR",
  dob: "12/04/2007",
  result: "PASSED",
  gpa: "5.00",
  institute: "DHAKA GOVT. HIGH SCHOOL",
  center: "DHAKA-10",
  subjects: [
    { code: "101", name: "BANGLA", grade: "A+" },
    { code: "107", name: "ENGLISH", grade: "A+" },
    { code: "109", name: "MATHEMATICS", grade: "A+" },
    { code: "136", name: "PHYSICS", grade: "A+" },
    { code: "137", name: "CHEMISTRY", grade: "A+" },
    { code: "138", name: "BIOLOGY", grade: "A+" },
    { code: "126", name: "HIGHER MATHEMATICS", grade: "A+" },
  ],
  created_at: new Date().toISOString(),
};
memoryStore.set("ssc-2024-dhaka-123456", {
  ...defaultSample,
  raw_html: generateTeletalkHtml(defaultSample),
});

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    APP_CONFIG.SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    APP_CONFIG.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    APP_CONFIG.SUPABASE_ANON_KEY;

  if (url && key && url.trim() !== "" && key.trim() !== "") {
    try {
      supabaseClient = createClient(url.trim(), key.trim(), {
        auth: { persistSession: false },
      });
      return supabaseClient;
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    APP_CONFIG.SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    APP_CONFIG.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    APP_CONFIG.SUPABASE_ANON_KEY;

  return Boolean(url && key && url.trim() !== "" && key.trim() !== "");
}

function getKey(exam: string, year: string, board: string, roll: string): string {
  return `${exam.toLowerCase().trim()}-${year.trim()}-${board.toLowerCase().trim()}-${roll.trim()}`;
}

/**
 * Find student result in Supabase (or memory fallback)
 */
export async function findStudentResult(
  exam: string,
  year: string,
  board: string,
  roll: string
): Promise<StudentResult | null> {
  const sb = getSupabase();
  const searchRoll = roll.trim();
  const searchBoard = board.toLowerCase().trim();
  const searchExam = exam.toLowerCase().trim();
  const searchYear = year.trim();

  if (sb) {
    try {
      const { data, error } = await sb
        .from("student_results")
        .select("*")
        .eq("exam", searchExam)
        .eq("year", searchYear)
        .eq("board", searchBoard)
        .eq("roll", searchRoll)
        .maybeSingle();

      if (!error && data) {
        return data as StudentResult;
      }
    } catch (err) {
      console.warn("Supabase query error, checking fallback store:", err);
    }
  }

  // Fallback / memory check
  const memKey = getKey(searchExam, searchYear, searchBoard, searchRoll);
  return memoryStore.get(memKey) || null;
}

/**
 * Save or update student result to Supabase
 */
export async function saveStudentResult(
  student: StudentResult
): Promise<StudentResult> {
  const normalized: StudentResult = {
    ...student,
    exam: student.exam.toLowerCase().trim(),
    board: student.board.toLowerCase().trim(),
    roll: student.roll.trim(),
    year: String(student.year).trim(),
    raw_html: student.raw_html || generateTeletalkHtml(student),
    updated_at: new Date().toISOString(),
  };

  const memKey = getKey(normalized.exam, normalized.year, normalized.board, normalized.roll);
  if (!normalized.id) {
    normalized.id = "res_" + Math.random().toString(36).substring(2, 11);
    normalized.created_at = new Date().toISOString();
  }
  memoryStore.set(memKey, normalized);

  const sb = getSupabase();
  if (sb) {
    try {
      // Upsert using unique constraint (exam, year, board, roll)
      const { data, error } = await sb
        .from("student_results")
        .upsert(
          {
            exam: normalized.exam,
            year: normalized.year,
            board: normalized.board,
            roll: normalized.roll,
            reg: normalized.reg || "",
            name: normalized.name,
            father_name: normalized.father_name || "",
            mother_name: normalized.mother_name || "",
            group: normalized.group || "GENERAL",
            type: normalized.type || "REGULAR",
            dob: normalized.dob || "",
            result: normalized.result || "PASSED",
            gpa: normalized.gpa || "",
            institute: normalized.institute || "",
            center: normalized.center || "",
            subjects: normalized.subjects || [],
            raw_html: normalized.raw_html,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "exam,year,board,roll" }
        )
        .select()
        .single();

      if (error) {
        console.error("Supabase upsert error:", error);
      } else if (data) {
        memoryStore.set(memKey, data as StudentResult);
        return data as StudentResult;
      }
    } catch (err) {
      console.error("Supabase error during save:", err);
    }
  }

  return normalized;
}

/**
 * Get all records for Admin panel
 */
export async function getAllStudentResults(): Promise<StudentResult[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from("student_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        // Sync to memory
        for (const item of data) {
          const key = getKey(item.exam, item.year, item.board, item.roll);
          memoryStore.set(key, item as StudentResult);
        }
        return data as StudentResult[];
      }
    } catch (err) {
      console.warn("Error getting all results from Supabase:", err);
    }
  }

  return Array.from(memoryStore.values()).sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  );
}

/**
 * Delete a student result by ID
 */
export async function deleteStudentResult(id: string): Promise<boolean> {
  let foundKey: string | null = null;
  for (const [k, v] of memoryStore.entries()) {
    if (v.id === id || v.roll === id) {
      foundKey = k;
      break;
    }
  }
  if (foundKey) {
    memoryStore.delete(foundKey);
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from("student_results").delete().eq("id", id);
      if (error) {
        // Try deleting by roll if id match didn't work
        await sb.from("student_results").delete().eq("roll", id);
      }
      return true;
    } catch (err) {
      console.error("Error deleting from Supabase:", err);
      return false;
    }
  }

  return true;
}
