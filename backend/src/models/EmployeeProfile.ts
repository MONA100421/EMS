import { Schema, model, Types } from "mongoose";

const AddressSchema = new Schema(
  {
    building: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  { _id: false },
);

const EmergencySchema = new Schema(
  {
    firstName: String,
    lastName: String,
    middleName: String,
    phone: String,
    email: String,
    relationship: String,
  },
  { _id: false },
);

const EmploymentSchema = new Schema(
  {
    visaTitle: String,
    startDate: Date,
    endDate: Date,
  },
  { _id: false },
);

const DocumentSchema = new Schema(
  {
    name: String,
    type: String,
    url: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    uploadedAt: Date,
  },
  { _id: false },
);

const EmployeeProfileSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },

    // Name section
    firstName: String,
    lastName: String,
    middleName: String,
    preferredName: String,

    ssn: String,
    dateOfBirth: Date,
    gender: String,

    // Address
    address: AddressSchema,

    // Contact
    phone: String,
    workPhone: String,

    // Employment
    employment: EmploymentSchema,

    // Emergency
    emergency: EmergencySchema,

    // Documents
    documents: [DocumentSchema],

    onboardingSubmittedAt: Date,
  },
  { timestamps: true },
);

export default model("EmployeeProfile", EmployeeProfileSchema);
