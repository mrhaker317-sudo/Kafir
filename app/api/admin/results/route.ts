import { NextRequest, NextResponse } from "next/server";
import {
  getAllStudentResults,
  saveStudentResult,
  deleteStudentResult,
  isSupabaseConfigured,
} from "@/lib/supabase";
import { generateTeletalkHtml } from "@/lib/teletalk-formatter";
import { StudentResult } from "@/lib/types";

export async function GET() {
  try {
    const results = await getAllStudentResults();
    const configured = isSupabaseConfigured();

    return NextResponse.json({
      success: true,
      configured,
      count: results.length,
      results,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error fetching results";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      exam = "ssc",
      year = "2024",
      board = "dhaka",
      roll,
      reg = "",
      name,
      father_name = "",
      mother_name = "",
      group = "SCIENCE",
      type = "REGULAR",
      dob = "",
      result = "PASSED",
      gpa = "5.00",
      institute = "",
      center = "",
      subjects = [],
    } = body;

    if (!roll || !roll.trim()) {
      return NextResponse.json(
        { success: false, error: "Roll number is required" },
        { status: 400 }
      );
    }
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Student name is required" },
        { status: 400 }
      );
    }

    const record: StudentResult = {
      id: id || undefined,
      exam: exam.toLowerCase().trim(),
      year: String(year).trim(),
      board: board.toLowerCase().trim(),
      roll: roll.trim(),
      reg: reg.trim(),
      name: name.trim().toUpperCase(),
      father_name: father_name.trim().toUpperCase(),
      mother_name: mother_name.trim().toUpperCase(),
      group: group.trim().toUpperCase(),
      type: type.trim().toUpperCase(),
      dob: dob.trim(),
      result: result.trim().toUpperCase(),
      gpa: gpa.trim(),
      institute: institute.trim().toUpperCase(),
      center: center.trim().toUpperCase(),
      subjects,
    };

    // Re-generate pixel-perfect authentic Teletalk HTML table
    record.raw_html = generateTeletalkHtml(record);

    const saved = await saveStudentResult(record);

    return NextResponse.json({
      success: true,
      message: "Student result saved successfully",
      student: saved,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error saving student result";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Result ID or Roll is required" },
        { status: 400 }
      );
    }

    const success = await deleteStudentResult(id);
    return NextResponse.json({
      success,
      message: success ? "Deleted successfully" : "Failed to delete",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error deleting record";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
