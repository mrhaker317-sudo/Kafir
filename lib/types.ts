export interface SubjectGrade {
  code: string;
  name: string;
  grade: string;
}

export interface StudentResult {
  id?: string;
  exam: string;
  year: string;
  board: string;
  roll: string;
  reg?: string;
  name: string;
  father_name?: string;
  mother_name?: string;
  group?: string;
  type?: string;
  dob?: string;
  result: string; // e.g. "PASSED", "FAILED"
  gpa?: string; // e.g. "5.00"
  institute?: string;
  center?: string;
  subjects?: SubjectGrade[];
  raw_html?: string;
  created_at?: string;
  updated_at?: string;
}
