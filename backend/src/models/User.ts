import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["employee", "hr", "admin"],
      default: "employee",
    },
    profile: {
      firstName: String,
      lastName: String,
      middleName: String,
      preferredName: String,
      dob: Date,
      ssn: String,
      gender: String,
      photoUrl: String,

      address: {
        street: String,
        apt: String,
        city: String,
        state: String,
        zip: String,
        country: String,
      },

      contact: {
        phone: String,
        workPhone: String,
      },

      emergency: {
        firstName: String,
        lastName: String,
        middleName: String,
        phone: String,
        email: String,
        relationship: String,
      },
    },

    workAuthorization: {
      isCitizen: Boolean,
      authType: {
        type: String,
      },
      startDate: Date,
      endDate: Date,
      title: String,
    },
  },
  { timestamps: true },
);

export default model("User", UserSchema);
