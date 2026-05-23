// src\lib\features\attendanceCategory\AttendanceCategoryRepository.js
import BaseRepository from '../base/BaseRepository';
import AttendanceCategory from './AttendanceCategoryModel';

export default class AttendanceCategoryRepository extends BaseRepository {
  constructor(db) {
    super(db, 'attendanceCategory', AttendanceCategory);
  }

  async getAllCategories() {
    return this.collection.aggregate([
      {
        $lookup: {
          from: 'attendanceName',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'names'
        }
      },
    ]).toArray();
  }
}
