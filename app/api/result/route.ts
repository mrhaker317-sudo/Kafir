import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      exam,
      year,
      board,
      roll,
      reg,
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

    // Build form-urlencoded payload for Teletalk server
    const params = new URLSearchParams();
    params.append("sr", "1");
    params.append("et", "2");
    params.append("exam", exam || "ssc");
    params.append("year", year || "2024");
    params.append("board", board);
    params.append("roll", roll.trim());
    params.append("reg", (reg || "").trim());
    params.append("value_a", String(value_a));
    params.append("value_b", String(value_b));
    params.append("value_s", String(value_s));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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

    // Clean up any PHP error output notice at top like 'Error occured.'
    rawHtml = rawHtml.replace(/^Error occured\./i, "").trim();

    return NextResponse.json({
      success: true,
      html: rawHtml,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to connect to Teletalk server";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
