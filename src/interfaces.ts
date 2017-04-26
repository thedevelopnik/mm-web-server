export interface StringKey {
  [key: string]: any;
}

export interface EducatorRegistrant {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SchoolRegistrant {
  name: string;
  email: string;
  password: string;
}

export interface Educator extends StringKey {
  id: number;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  active: boolean;
  avatarUrl: string;
  description: string;
  ageRanges: number[];
  ageRangesWgt: number;
  cals: number[];
  calsWgt: number;
  orgTypes: number[];
  orgTypesWgt: number;
  locTypes: number[];
  locTypesWgt: number;
  edTypes: number[];
  edTypesWgt: number;
  sizes: number[];
  sizesWgt: number;
  trainings: number[];
  trainingsWgt: number;
  traits: number[];
  traitsWgt: number;
  states: number[];
  statesWgt: number;
}

export interface School extends StringKey {
  id: number;
  displayName: string;
  name: string;
  email: string;
  password: string;
  active: boolean;
  avatarUrl: string;
  description: string;
}

export interface SchoolMatchingProfile extends StringKey {
  id: number;
  schoolId: number;
  active: boolean;
  ageRanges: number[];
  ageRangesWgt: number;
  cals: number[];
  calsWgt: number;
  orgTypes: number[];
  orgTypesWgt: number;
  locTypes: number[];
  locTypesWgt: number;
  edTypes: number[];
  edTypesWgt: number;
  sizes: number[];
  sizesWgt: number;
  trainings: number[];
  trainingsWgt: number;
  traits: number[];
  traitsWgt: number;
  states: number[];
  statesWgt: number;
}

export interface Match extends StringKey {
  id: number;
  schoolMatchingProfileId: number;
  educatorId: number;
  percentage: number;
  educatorConfirmation: boolean;
  schoolConfirmation: boolean;
  educatorDenial: boolean;
  schoolDenial: boolean;
}