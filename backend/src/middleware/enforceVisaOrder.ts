import { Request, Response, NextFunction } from "express";
import Document from "../models/Document";

export const enforceVisaOrder = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type, category } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized",
      });
    }

    if (category !== "visa") {
      return next();
    }

    const visaOrder = ["opt_receipt", "opt_ead", "i_983", "i_20"];

    const currentIndex = visaOrder.indexOf(type);

    if (currentIndex === -1) {
      return res.status(400).json({
        ok: false,
        message: "Invalid visa document type",
      });
    }

    if (currentIndex === 0) {
      return next();
    }

    const previousType = visaOrder[currentIndex - 1];

    const previousDoc = await Document.findOne({
      user: userId,
      type: previousType,
      status: "approved",
    });

    if (!previousDoc) {
      return res.status(400).json({
        ok: false,
        message:
          "You must complete and get approval for the previous visa document before uploading this one.",
      });
    }

    return next();
  } catch (err) {
    console.error("enforceVisaOrder error:", err);
    return res.status(500).json({ ok: false });
  }
};
