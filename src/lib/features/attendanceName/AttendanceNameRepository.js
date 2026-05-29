// src\lib\features\attendanceName\AttendanceNameRepository.js
import BaseRepository from '../base/BaseRepository';
import AttendanceName from './AttendanceNameModel';

export default class AttendanceNameRepository extends BaseRepository {
  constructor(db) {
    super(db, 'attendanceName', AttendanceName);
  }

  async getAllNamesWithCategoryName() {
    const pipeline = [
      {
        $lookup: {
          from: 'attendanceCategory',
          let: { nameCategoryId: '$categoryId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', { $toObjectId: '$$nameCategoryId' }]
                }
              }
            }
          ],
          as: 'categoryDetails'
        }
      },
      {
        $unwind: {
          path: '$categoryDetails',
          preserveNullAndEmptyArrays: false // 1. This drops any document without a matching category
        }
      },
      {
        $project: {
          _id: 1,
          name: '$name',
          categoryName: '$categoryDetails.name', // 2. No more fallback needed, it's guaranteed to exist
          displayName: { $concat: ['$name', ' ', '$categoryDetails.name'] } // 3. Simplified concatenation
        }
      }
    ];

    return this.collection.aggregate(pipeline).toArray();
  }
}
