import { ObjectId } from 'mongodb';

const hiddenFields = ['password', 'token', 'OTP', 'secret', 'hashed_password'];

/**
 * Serialize MongoDB document(s) for sending to client
 * Converts ObjectId -> string, Date -> ISO string
 * Hides sensitive fields if specified
 */
export function serializeDoc(doc) {
  if (!doc) return null;

  // Handle if the top-level item passed is an array
  if (Array.isArray(doc)) return doc.map((d) => serializeDoc(d));

  const result = {};
  for (const [key, value] of Object.entries(doc)) {
    if (hiddenFields.includes(key)) continue;

    if (value instanceof ObjectId) {
      result[key] = value.toString();
    } else if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) => {
        if (v instanceof ObjectId) return v.toString();
        if (v instanceof Date) return v.toISOString();
        if (v && typeof v === 'object') return serializeDoc(v);
        return v;
      });
    } else if (value && typeof value === 'object') {
      result[key] = serializeDoc(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Unserialize client data to MongoDB-ready format
 * Converts string _id -> ObjectId and ISO string -> Date
 */
export function unserializeDoc(doc) {
  if (!doc) return null;

  // Handle if the top-level item passed is an array
  if (Array.isArray(doc)) return doc.map(unserializeDoc);

  const result = {};
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/i;

  for (const [key, value] of Object.entries(doc)) {
    if (typeof value === 'string') {
      if (ObjectId.isValid(value) && (value.length === 12 || value.length === 24)) {
        result[key] = new ObjectId(value);
      } else if (isoDateRegex.test(value)) {
        result[key] = new Date(value);
      } else {
        result[key] = value;
      }
    } else if (Array.isArray(value)) {
      result[key] = value.map((v) => {
        if (typeof v === 'string') {
          if (ObjectId.isValid(v) && (v.length === 12 || v.length === 24)) {
            return new ObjectId(v);
          }
          if (isoDateRegex.test(v)) {
            return new Date(v);
          }
          return v;
        }
        if (v && typeof v === 'object') return unserializeDoc(v);
        return v;
      });
    } else if (value && typeof value === 'object') {
      result[key] = unserializeDoc(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}