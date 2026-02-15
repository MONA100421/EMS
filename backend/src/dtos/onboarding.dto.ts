export type WorkAuthType = "f1" | "h1" | "h4" | "other";

export interface OnboardingFormDTO {
  firstName: string;
  lastName: string;
  preferredName?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  workAuthType?: WorkAuthType;
  // ... 其他表單欄位, 明確列出
}
