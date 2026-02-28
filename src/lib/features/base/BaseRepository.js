import { ObjectId } from 'mongodb';
import AppError, { handleSuccess } from '$lib/core/server/error';

export default class BaseRepository {
  constructor(db, collectionName, Model) {
    this.collection = db.collection(collectionName);
    this.Model = Model;
  }

  // Convert to ObjectId safely
  toObjectId(id) {
    if (!ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format');
    }
    return new ObjectId(id);
  }

  // Convert DB doc → Model instance
  toModel(doc, projection = {}) {
    if (!doc) return null;

    const obj = { id: doc._id.toString() };

    // Only include projected fields (like MongoDB)
    if (projection && Object.keys(projection).length > 0) {
      const includeMode = Object.values(projection).some((v) => v === 1);

      if (includeMode) {
        // Include only fields with 1
        for (const key in projection) {
          if (projection[key] && key in doc) {
            obj[key] = doc[key];
          }
        }
      } else {
        // Exclude fields with 0
        for (const key in doc) {
          if (!(key in projection && projection[key] === 0)) {
            obj[key] = doc[key];
          }
        }
      }
    } else {
      // No projection, include all fields
      Object.assign(obj, doc);
    }

    return obj;
  }

  // Create
  async create(data) {
    const result = await this.collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: null,
    });

    if (!result.acknowledged) {
      throw new AppError('Database insert failed');
    }

    return handleSuccess('Created Success');
  }

  // Find one
  async findOne(query) {
    return await this.collection.findOne(query);
  }

  // Find by ID
  async findById(id) {
    const doc = await this.collection.findOne({
      _id: this.toObjectId(id),
    });

    return this.toModel(doc);
  }

  // Find All with proper projection
  async findAll(filter = {}, projection = {}) {
    const docs = await this.collection.find(filter, { projection }).toArray();
    return docs.map((doc) => this.toModel(doc, projection));
  }

  // Update
  async updateById(id, data) {
    const result = await this.collection.updateOne(
      { _id: this.toObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
    );

    if (!result.acknowledged) {
      throw new AppError('Database update failed');
    }

    return handleSuccess('Updated Success');
  }

  // Delete
  async deleteById(id) {
    const result = await this.collection.deleteOne({
      _id: this.toObjectId(id),
    });

    if (!result.acknowledged) {
      throw new AppError('Database delete failed');
    }

    return handleSuccess('Deleted Success');
  }
}
