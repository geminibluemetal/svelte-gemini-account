import { sseEmit } from "$lib/core/server/sseBus";
import AttendanceCategoryService from "$lib/features/attendanceCategory/AttendanceCategoryService";
import AttendanceNameService from "$lib/features/attendanceName/AttendanceNameService";
import { formDataToObject } from "$lib/utils/form.js";
import { serializeDoc } from "$lib/utils/serializer";
import { fail } from "@sveltejs/kit";

export async function load({ depends }) {
  depends('ATTENDANCE.LIST');
  const attendanceCategoryService = new AttendanceCategoryService();
  const attendanceNameService = new AttendanceNameService();
  const attendanceCategories = await attendanceCategoryService.getAllCategories();
  const attendanceNames = await attendanceNameService.getAllNames();
  const response = {
    attendanceCategories,
    attendanceNames,
  };
  return serializeDoc(response);
}

export const actions = {
  editCategory: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const attendanceCategoryService = new AttendanceCategoryService();
    const result = await attendanceCategoryService.editCategory(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }
    sseEmit({ type: 'ATTENDANCE.LIST' });
    return result;
  },

  editName: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const attendanceNameService = new AttendanceNameService();
    const result = await attendanceNameService.updateName(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }
    sseEmit({ type: 'ATTENDANCE.LIST' });
    return result;
  },
};