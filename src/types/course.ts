export interface Course {
  course_name: string;
  syllabus_number?: string;
  is_full_year?: boolean;
  semester?: number;
  quarter?: number;
  credits: number;
  is_required_to_graduate?: boolean;
  is_enrollable_ds?: boolean;
  is_required_to_master_ds?: boolean;
  is_enrollable_ie?: boolean;
  is_required_to_master_ie?: boolean;
  is_enrollable_ba?: boolean;
  is_required_to_master_ba?: boolean;
  is_teaching_program_course?: boolean;
  is_teaching_program?: boolean;
  is_required_to_teaching_program?: boolean;
}
