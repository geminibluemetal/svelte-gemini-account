// src\lib\features\attendance\AttendanceListener.js

import { serverBus } from '$lib/core/server/serverBus';
import { EVENTS } from '$lib/core/server/serverBusEvents';
import { sseEmit } from '$lib/core/server/sseBus';
import AttendanceService from './AttendanceService';

const attendanceService = new AttendanceService();

// Remove any existing listeners for this event to prevent duplicates
serverBus.removeAllListeners(EVENTS.ATTENDANCE.UPDATE_ADVANCE_AMOUNT);

// find and update phone
serverBus.on(EVENTS.ATTENDANCE.UPDATE_ADVANCE_AMOUNT, async ({ oldCash, newCash }) => {
  attendanceService.syncAttendanceAdvance(oldCash, newCash);
  sseEmit({ type: 'ATTENDANCE.LIST' });
});

console.log('✅ Attendance listeners registered');
