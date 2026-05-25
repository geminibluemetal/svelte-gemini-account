// src\lib\features\attendance\AttendanceRepository.js
import BaseRepository from '../base/BaseRepository';
import Attendance from './AttendanceModel';

export default class AttendanceRepository extends BaseRepository {
  constructor(db) {
    super(db, 'attendance', Attendance);
  }
}
