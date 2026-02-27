export interface IMasterStaseResponse {
  id: number;
  name: string;
  defaultHospitalId: number | null;
  templateFolder: string;
  hasLogbook: boolean;
  hasPortfolio: boolean;
  hasDopExam: boolean;
  hasOslar: boolean;
  hasCaseReport: boolean;
  hasAttitude: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ICreateStaseDTO {
  name: string;
  defaultHospitalId?: number;
  templateFolder?: string;
  hasLogbook?: boolean;
  hasPortfolio?: boolean;
  hasDopExam?: boolean;
  hasOslar?: boolean;
  hasCaseReport?: boolean;
  hasAttitude?: boolean;
}

export interface IUpdateStaseDTO {
  name?: string;
  defaultHospitalId?: number | null;
  templateFolder?: string;
  hasLogbook?: boolean;
  hasPortfolio?: boolean;
  hasDopExam?: boolean;
  hasOslar?: boolean;
  hasCaseReport?: boolean;
  hasAttitude?: boolean;
}

export interface IStaseListQuery {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}

export interface IPaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
