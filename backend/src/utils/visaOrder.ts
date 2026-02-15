export const VISA_FLOW = ["opt_receipt", "opt_ead", "i_983", "i_20"];

export interface VisaOrderValidation {
  ok: boolean;
  message?: string;
}

export async function validateVisaOrderForUser(
  userId: string,
  type: string,
): Promise<VisaOrderValidation> {
  return { ok: true };
}

export async function getNextVisaStep(userId: string): Promise<string> {
  return "Next Step";
}
