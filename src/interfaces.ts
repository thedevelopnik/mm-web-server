export interface IStringKey {
  [key: string]: any;
}

export interface IEducator extends IStringKey {
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

export interface ISchool extends IStringKey {
  id: number;
  displayName: string;
  name: string;
  email: string;
  password: string;
  active: boolean;
  avatarUrl: string;
  description: string;
}

export interface ISchoolMatchingProfile extends IStringKey {
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

export interface IMatch extends IStringKey {
  id: number;
  schoolMatchingProfileId: number;
  educatorId: number;
  percentage: number;
  educatorConfirmation: boolean;
  schoolConfirmation: boolean;
  educatorDenial: boolean;
  schoolDenial: boolean;
}
