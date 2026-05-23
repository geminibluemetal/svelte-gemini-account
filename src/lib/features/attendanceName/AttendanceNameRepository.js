// src\lib\features\attendanceName\AttendanceNameRepository.js
import BaseRepository from '../base/BaseRepository';
import AttendanceName from './AttendanceNameModel';

export default class AttendanceNameRepository extends BaseRepository {
  constructor(db) {
    super(db, 'attendanceName', AttendanceName);
  }
}
