import { NextRequest, NextResponse } from "next/server";
import { findStudentResult, saveStudentResult } from "@/lib/supabase";
import { parseTeletalkHtml } from "@/lib/teletalk-formatter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      exam = "ssc",
      year = "2024",
      board,
      roll,
      reg = "",
      value_a,
      value_b,
      value_s,
    } = body;

    // Validate inputs
    if (!board || board === "-1") {
      return NextResponse.json(
        { success: false, error: "Please Select Board!" },
        { status: 400 }
      );
    }
    if (!roll || !roll.trim()) {
      return NextResponse.json(
        { success: false, error: "Please Enter Exam Roll!" },
        { status: 400 }
      );
    }
    if (value_s === undefined || value_s === "") {
      return NextResponse.json(
        { success: false, error: "Please Enter the Value!" },
        { status: 400 }
      );
    }

    const cleanRoll = roll.trim();
    const cleanYear = String(year).trim();
    const cleanBoard = String(board).toLowerCase().trim();
    const cleanExam = String(exam).toLowerCase().trim();
    const cleanReg = String(reg).trim();

    // 1. STEP ONE: Check Database first (Supabase)
    const existingResult = await findStudentResult(
      cleanExam,
      cleanYear,
      cleanBoard,
      cleanRoll
    );

    if (existingResult && existingResult.raw_html) {
      return NextResponse.json({
        success: true,
        html: existingResult.raw_html,
        source: "database",
        student: existingResult,
      });
    }

    // 2. STEP TWO: If not in database, query Teletalk server
    const params = new URLSearchParams();
    params.append("sr", "1");
    params.append("et", "2");
    params.append("exam", cleanExam);
    params.append("year", cleanYear);
    params.append("board", cleanBoard);
    params.append("roll", cleanRoll);
    params.append("reg", cleanReg);
    params.append("value_a", String(value_a));
    params.append("value_b", String(value_b));
    params.append("value_s", String(value_s));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const upstreamRes = await fetch(
      "http://oldweb.teletalk.com.bd/result.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "http://oldweb.teletalk.com.bd/",
        },
        body: params.toString(),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Teletalk server returned status ${upstreamRes.status}. Please try again.`,
        },
        { status: 502 }
      );
    }

    let rawHtml = await upstreamRes.text();
    rawHtml = rawHtml.replace(/^Error occured\./i, "").trim();

    // 3. STEP THREE: If a real result was found from Teletalk, automatically save it to Supabase!
    const isFound =
      !rawHtml.includes("RESULT NOT FOUND!") &&
      !rawHtml.includes("RESULT IS NOT PUBLISHED YET!") &&
      !rawHtml.includes("Entered value does not match!");

    if (isFound) {
      try {
        const parsed = parseTeletalkHtml(rawHtml, {
          exam: cleanExam,
          year: cleanYear,
          board: cleanBoard,
          roll: cleanRoll,
          reg: cleanReg,
        });

        if (parsed) {
          await saveStudentResult(parsed);
        }
      } catch (saveErr) {
        console.warn("Failed to auto-save result to database:", saveErr);
      }
    }

    return NextResponse.json({
      success: true,
      html: rawHtml,
      source: "teletalk",
      savedToDb: isFound,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to connect to result server";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
