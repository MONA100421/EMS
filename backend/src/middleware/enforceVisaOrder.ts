import { Request, Response, NextFunction } from "express";

export const enforceVisaOrder = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  const { type, category } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized",
    });
  }

  const validTypes = [
    "id_card",
    "work_auth",
    "profile_photo",
    "opt_receipt",
    "opt_ead",
    "i_983",
    "i_20",
  ];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document type",
    });
  }

  return next();
};
