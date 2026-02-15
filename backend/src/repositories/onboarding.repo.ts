import OnboardingApplicationModel from "../models/OnboardingApplication";
import { Types } from "mongoose";

export const OnboardingRepo = {
  async findByUser(userId: string) {
    return OnboardingApplicationModel.findOne({ user: userId });
  },

  async findByUserLean(userId: string) {
    return OnboardingApplicationModel.findOne({ user: userId }).lean();
  },

  async findById(id: string) {
    return OnboardingApplicationModel.findById(id);
  },

  async create(payload: Partial<any>) {
    return OnboardingApplicationModel.create(payload);
  },

  async save(doc: any, options: any = {}) {
    return doc.save(options);
  },

  async findAllWithUser() {
    return OnboardingApplicationModel.find().populate("user", "username email");
  },

  // ... other helper queries
};
