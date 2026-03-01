import { ObjectId } from 'mongodb';
import AppError, { handleSuccess } from '$lib/core/server/error';

export default class BaseRepository {
  constructor(db, collectionName, Model) {
    this.collection = db.collection(collectionName);
    this.Model = Model;
  }

  // Convert to ObjectId safely
  toObjectId(id) {
    if (!ObjectId.isValid(id)) throw new AppError('Invalid ID format');
    return new ObjectId(id);
  }

  // Convert DB doc → Model instance
  toModel(doc, projection) {
    if (!doc) return null;
    return this.Model({ id: doc._id.toString(), ...doc }, projection);
  }

  // Create
  async create(data) {
    const result = await this.collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: null,
    });

    if (!result.acknowledged) throw new AppError('Database insert failed');
    return handleSuccess('Created Success');
  }

  // Find one
  async findOne(query = {}) {
    const doc = await this.collection.findOne(query);
    return this.toModel(doc);
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
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Updated Success');
  }

  // Update Fields
  async updateFieldsById(id, updates) {
    const result = await this.collection.updateOne({ _id: this.toObjectId(id) }, { $set: updates });
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Fields updated successfully');
  }

  // Update Fields
  async updateFields(updates) {
    const result = await this.collection.updateOne({}, { $set: updates });
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Fields updated successfully');
  }

  // Delete
  async deleteById(id) {
    const result = await this.collection.deleteOne({
      _id: this.toObjectId(id),
    });
    if (!result.acknowledged) throw new AppError('Database delete failed');
    return handleSuccess('Deleted Success');
  }

  // Delete with filter
  async deleteByFilter(filter) {
    const result = await this.collection.deleteMany(filter);
    if (!result.acknowledged) throw new AppError('Database delete failed');
    return handleSuccess('Deleted Success');
  }

  // Update aggregation fields
  async updateAggregationById(id, aggregationUpdatesArray) {
    const result = await this.collection.updateOne({ _id: this.toObjectId(id) }, aggregationUpdatesArray);
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Fields updated successfully');
  }
}
