export interface IHospitalResponse {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ICreateHospital {
  name: string;
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface IUpdateHospital {
  name?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface IHospitalListQuery {
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
