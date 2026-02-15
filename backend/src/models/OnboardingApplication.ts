import { Schema, model, Types } from "mongoose";

const OnboardingApplicationSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["never_submitted", "pending", "approved", "rejected"],
      default: "never_submitted",
    },

    formData: {
      type: Schema.Types.Mixed,
    },

    hrFeedback: String,

    history: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        action: String,
      },
    ],

    submittedAt: Date,
    reviewedAt: Date,
  },
  { timestamps: true },
);

export default model("OnboardingApplication", OnboardingApplicationSchema);
