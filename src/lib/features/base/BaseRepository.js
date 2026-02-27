import { ObjectId } from 'mongodb';
import AppError from '$lib/core/server/error';

export default class BaseRepository {
  constructor(db, collectionName, ModelClass) {
    this.collection = db.collection(collectionName);
    this.Model = ModelClass;
  }

  // Convert to ObjectId safely
  toObjectId(id) {
    if (!ObjectId.isValid(id)) {
      throw new AppError('Invalid ID format');
    }
    return new ObjectId(id);
  }

  // Convert DB doc → Model instance
  toModel(doc) {
    if (!doc) return null;

    return new this.Model({
      id: doc._id.toString(),
      ...doc,
    });
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

    return await this.findById(result.insertedId);
  }

  // Find by ID
  async findById(id) {
    const doc = await this.collection.findOne({
      _id: this.toObjectId(id),
    });

    return this.toModel(doc);
  }

  // Find All
  async findAll(filter = {}) {
    const docs = await this.collection.find(filter).toArray();
    return docs.map((doc) => this.toModel(doc));
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

    return await this.findById(id);
  }

  // Delete
  async deleteById(id) {
    const result = await this.collection.deleteOne({
      _id: this.toObjectId(id),
    });

    if (!result.acknowledged) {
      throw new AppError('Database delete failed');
    }

    return true;
  }
}
