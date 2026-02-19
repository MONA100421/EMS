export type WorkAuthType =
  | "citizen"
  | "green-card"
  | "opt"
  | "opt-stem"
  | "h1b"
  | "l2"
  | "h4"
  | "other";

export interface OnboardingFormDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  ssn: string;
  dateOfBirth: string;
  gender?: string;

  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;

  workAuthType: WorkAuthType;
  workAuthOther?: string;

  visaStart?: string;
  visaEnd?: string;
}
