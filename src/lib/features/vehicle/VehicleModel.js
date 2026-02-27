export default class VehicleModel {
  constructor({
    id = null,
    fullNumber = null,
    shortNumber = null,
    isCompanyVehicle = false,
    bodyCapacity = [],
    createdAt = null,
    updatedAt = null,
  } = {}) {
    this.id = id;
    this.fullNumber = fullNumber;
    this.shortNumber = shortNumber;
    this.isCompanyVehicle = isCompanyVehicle;
    this.bodyCapacity = bodyCapacity;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
