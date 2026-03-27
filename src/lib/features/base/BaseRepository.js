import { ObjectId } from 'mongodb';
import AppError, { handleSuccess } from '$lib/core/server/error';

export default class BaseRepository {
  constructor(db, collectionName, Model) {
    this.db = db;
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
      createdAt: new Date(),
      updatedAt: null,
      ...data,
    });
    if (!result.acknowledged) throw new AppError('Database insert failed');
    return handleSuccess('Created Success', result);
  }

  // Find one
  async findOne(query = {}, projection = {}, options = {}) {
    const finalOptions = { ...options, projection };
    const doc = await this.collection.findOne(query, finalOptions);
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
  async findAll(filter = {}, projection = {}, options) {
    const docs = await this.collection.find(filter, { projection, ...options }).toArray();
    return docs.map((doc) => this.toModel(doc, projection));
  }

  // Update
  async updateById(id, data) {
    const result = await this.collection.updateOne(
      { _id: this.toObjectId(id) },
      { $set: { updatedAt: new Date(), ...data } },
    );
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Updated Success', result);
  }

  // Update Fields
  async updateFieldsById(id, updates) {
    const result = await this.collection.updateOne({ _id: this.toObjectId(id) }, { $set: updates });
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Fields updated successfully', result);
  }

  // Update Fields
  async updateFields(updates) {
    const result = await this.collection.updateOne({}, { $set: updates });
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Fields updated successfully', result);
  }

  // Bulk Update By Filter
  async updateByFilter(filter = {}, updates = {}) {
    const result = await this.collection.updateMany(filter, { $set: updates });
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Bulk updated successfully', result);
  }

  // Delete
  async deleteById(id) {
    const result = await this.collection.deleteOne({
      _id: this.toObjectId(id),
    });
    if (!result.acknowledged) throw new AppError('Database delete failed');
    return handleSuccess('Deleted Success', result);
  }

  // Delete with filter
  async deleteByFilter(filter) {
    const result = await this.collection.deleteMany(filter);
    if (!result.acknowledged) throw new AppError('Database delete failed');
    return handleSuccess('Deleted Success', result);
  }

  // Toggle sign by aggregation
  async toggleSignById(id) {
    const result = await this.toggleFieldById(id, 'sign');
    return result;
  }

  // Toggle aggregation fields
  async toggleFieldById(id, field) {
    const result = await this.collection.updateOne({ _id: this.toObjectId(id) }, [
      { $set: { [field]: { $not: `$${field}` } } },
    ]);
    if (!result.acknowledged) throw new AppError('Database update failed');
    return handleSuccess('Toggled successfully', result);
  }

  getDateFilter(dateInput, fieldName) {
    const date = new Date(dateInput);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return {
      [fieldName]: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    };
  }
}
