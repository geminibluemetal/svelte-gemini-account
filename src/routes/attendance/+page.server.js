import { sseEmit } from '$lib/core/server/sseBus';
import AttendanceCategoryService from '$lib/features/attendanceCategory/AttendanceCategoryService';
import AttendanceNameService from '$lib/features/attendanceName/AttendanceNameService';
import { formDataToObject } from '$lib/utils/form.js';
import { serializeDoc } from '$lib/utils/serializer';
import { fail } from '@sveltejs/kit';
import { get14dayCycle } from './helper.js';
import AttendanceService from '$lib/features/attendance/AttendanceService.js';

export async function load({ depends, url }) {
  depends('ATTENDANCE.LIST');
  let cycleOffset = url.searchParams.get('cycleOffset');
  cycleOffset = cycleOffset > 0 ? 0 : cycleOffset;
  const cycle = get14dayCycle({ ignoreFuture: true, cycleOffset });
  const attendanceCategoryService = new AttendanceCategoryService();
  const attendanceNameService = new AttendanceNameService();
  const attendanceService = new AttendanceService();
  const attendanceCategories = await attendanceCategoryService.getAllCategories();
  const attendanceNames = await attendanceNameService.getAllNames();
  const attendance = await attendanceService.getAttendanceData(cycle.startDate, cycle.endDate);
  const response = {
    attendanceCategories,
    attendanceNames,
    attendance,
    cycle,
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

  editAttendance: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const attendanceService = new AttendanceService();
    const result = await attendanceService.saveAttendance(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }
    sseEmit({ type: 'ATTENDANCE.LIST' });
    return result;
  },

  setAttendance: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const attendanceService = new AttendanceService();
    const result = await attendanceService.setAttendance(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }
    sseEmit({ type: 'ATTENDANCE.LIST' });
    return result;
  },

  setTip: async ({ request }) => {
    const formData = await request.formData();
    const data = formDataToObject(formData);
    const attendanceService = new AttendanceService();
    const result = await attendanceService.setTip(data);

    if (!result?.ok) {
      return fail(400, { message: result.message });
    }
    sseEmit({ type: 'ATTENDANCE.LIST' });
    return result;
  },
};
