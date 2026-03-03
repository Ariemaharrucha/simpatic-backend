export interface ITemplateInfo {
  folder: string;
  name: string;
  description: string;
}

export interface ITemplateListResponse {
  templates: ITemplateInfo[];
}
