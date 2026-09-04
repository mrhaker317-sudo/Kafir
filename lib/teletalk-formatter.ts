import { StudentResult, SubjectGrade } from "./types";

export const BOARD_NAMES: Record<string, string> = {
  barisal: "BARISAL",
  chittagong: "CHITTAGONG",
  comilla: "COMILLA",
  dhaka: "DHAKA",
  dinajpur: "DINAJPUR",
  jessore: "JESSORE",
  mymensingh: "MYMENSINGH",
  rajshahi: "RAJSHAHI",
  sylhet: "SYLHET",
  madrasah: "MADRASAH",
  tec: "TECHNICAL",
  dibs: "DIBS(DHAKA)",
};

export const EXAM_NAMES: Record<string, string> = {
  ssc: "SSC/DAKHIL/EQUIVALENT",
  jsc: "JSC/JDC",
  ssc_voc: "SSC(VOCATIONAL)",
  hsc: "HSC/ALIM/EQUIVALENT",
  hsc_voc: "HSC(VOCATIONAL)",
  hsc_bm: "HSC(BM)",
  dc: "DIPLOMA IN COMMERCE",
  dbs: "DIPLOMA IN BUSINESS STUDIES",
};

/**
 * Generate official Teletalk style HTML for a student result.
 */
export function generateTeletalkHtml(res: StudentResult): string {
  const boardLabel = BOARD_NAMES[res.board.toLowerCase()] || res.board.toUpperCase();
  const subjects = res.subjects && res.subjects.length > 0 ? res.subjects : [];

  let subjectsHtml = "";
  if (subjects.length > 0) {
    subjectsHtml = `
      <tr>
        <td height="30" align="center" valign="middle" class="black12bold" style="padding-top: 15px; padding-bottom: 5px;">
          <b>Subject-Wise Grade/Marks</b>
        </td>
      </tr>
      <tr>
        <td align="center" valign="middle">
          <table width="100%" border="1" cellpadding="3" cellspacing="0" bordercolor="#CCCCCC" class="black12" style="border-collapse: collapse; text-align: left; font-size: 11px; font-family: Verdana, Arial, Helvetica, sans-serif;">
            <thead>
              <tr bgcolor="#E6F2FF" style="font-weight: bold;">
                <th width="20%" align="center" style="padding: 4px;">Subject Code</th>
                <th width="60%" align="left" style="padding: 4px;">Subject Name</th>
                <th width="20%" align="center" style="padding: 4px;">Grade</th>
              </tr>
            </thead>
            <tbody>
              ${subjects
                .map(
                  (s, idx) => `
                <tr bgcolor="${idx % 2 === 0 ? '#FFFFFF' : '#F9F9F9'}">
                  <td align="center" style="padding: 4px;">${s.code || '-'}</td>
                  <td align="left" style="padding: 4px;">${s.name || '-'}</td>
                  <td align="center" style="padding: 4px; font-weight: bold;">${s.grade || '-'}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </td>
      </tr>
    `;
  }

  return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-family: Verdana, Arial, Helvetica, sans-serif; font-size: 12px; color: #333333; margin-top: 15px;">
      <tr>
        <td align="center" valign="middle" style="padding-bottom: 8px;">
          <span style="font-size: 13px; font-weight: bold; color: #007814;">
            ${EXAM_NAMES[res.exam.toLowerCase()] || res.exam.toUpperCase()} RESULT ${res.year}
          </span>
        </td>
      </tr>
      <tr>
        <td align="center" valign="middle">
          <table width="100%" border="1" cellpadding="4" cellspacing="0" bordercolor="#CCCCCC" class="black12" style="border-collapse: collapse; text-align: left; font-size: 11px;">
            <tbody>
              <tr>
                <td width="20%" align="left" valign="middle" bgcolor="#F4F0F2"><b>Roll No</b></td>
                <td width="30%" align="left" valign="middle">${res.roll}</td>
                <td width="20%" align="left" valign="middle" bgcolor="#F4F0F2"><b>Name</b></td>
                <td width="30%" align="left" valign="middle"><b>${res.name || 'N/A'}</b></td>
              </tr>
              <tr>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Board</b></td>
                <td align="left" valign="middle">${boardLabel}</td>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Father's Name</b></td>
                <td align="left" valign="middle">${res.father_name || 'N/A'}</td>
              </tr>
              <tr>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Group</b></td>
                <td align="left" valign="middle">${res.group || 'GENERAL'}</td>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Mother's Name</b></td>
                <td align="left" valign="middle">${res.mother_name || 'N/A'}</td>
              </tr>
              <tr>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Type</b></td>
                <td align="left" valign="middle">${res.type || 'REGULAR'}</td>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Date of Birth</b></td>
                <td align="left" valign="middle">${res.dob || 'N/A'}</td>
              </tr>
              <tr>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Result</b></td>
                <td align="left" valign="middle"><b style="color: ${res.result?.toUpperCase() === 'FAILED' ? '#D00' : '#007814'};">${res.result || 'PASSED'}</b></td>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Institute</b></td>
                <td align="left" valign="middle">${res.institute || 'N/A'}</td>
              </tr>
              <tr>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>GPA</b></td>
                <td align="left" valign="middle"><b style="color: #007814; font-size: 13px;">${res.gpa || 'N/A'}</b></td>
                <td align="left" valign="middle" bgcolor="#F4F0F2"><b>Center</b></td>
                <td align="left" valign="middle">${res.center || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
      ${subjectsHtml}
    </table>
  `.trim();
}

/**
 * Extract structured student data from authentic raw Teletalk HTML
 */
export function parseTeletalkHtml(
  rawHtml: string,
  meta: { exam: string; year: string; board: string; roll: string; reg?: string }
): StudentResult | null {
  if (
    !rawHtml ||
    rawHtml.includes("RESULT NOT FOUND!") ||
    rawHtml.includes("RESULT IS NOT PUBLISHED YET!") ||
    rawHtml.includes("Entered value does not match!")
  ) {
    return null;
  }

  const clean = rawHtml.replace(/\s+/g, " ");

  const extractBetween = (label: string): string => {
    const regex = new RegExp(`>${label}<\\/td>\\s*<td[^>]*>(?:<b>)?(.*?)(?:<\\/b>)?<\\/td>`, "i");
    const match = clean.match(regex);
    if (match && match[1]) {
      return match[1].replace(/<[^>]*>/g, "").trim();
    }
    return "";
  };

  const name = extractBetween("Name") || "STUDENT";
  const father_name = extractBetween("Father's Name");
  const mother_name = extractBetween("Mother's Name");
  const group = extractBetween("Group") || "GENERAL";
  const type = extractBetween("Type") || "REGULAR";
  const dob = extractBetween("Date of Birth");
  const result = extractBetween("Result") || "PASSED";
  const gpa = extractBetween("GPA");
  const institute = extractBetween("Institute");
  const center = extractBetween("Center");

  // Parse subjects if present
  const subjects: SubjectGrade[] = [];
  const rowRegex = /<tr[^>]*>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<td[^>]*>(.*?)<\/td>\s*<\/tr>/gi;
  let rowMatch;
  while ((rowMatch = rowRegex.exec(rawHtml)) !== null) {
    const code = rowMatch[1].replace(/<[^>]*>/g, "").trim();
    const subName = rowMatch[2].replace(/<[^>]*>/g, "").trim();
    const grade = rowMatch[3].replace(/<[^>]*>/g, "").trim();
    if (code && subName && grade) {
      subjects.push({ code, name: subName, grade });
    }
  }

  return {
    exam: meta.exam,
    year: meta.year,
    board: meta.board.toLowerCase(),
    roll: meta.roll.trim(),
    reg: meta.reg ? meta.reg.trim() : "",
    name,
    father_name,
    mother_name,
    group,
    type,
    dob,
    result,
    gpa,
    institute,
    center,
    subjects,
    raw_html: rawHtml,
  };
}
