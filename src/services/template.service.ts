import * as fs from "fs";
import * as path from "path";
import { ITemplateInfo, ITemplateListResponse } from "../types/template.types";

const TEMPLATE_DIR = path.join(process.cwd(), "src/resources/template");

const formatName = (folder: string): string => {
  return folder
    .replace("stase-", "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const TemplateService = {
  getAvailableTemplates: async (): Promise<ITemplateListResponse> => {
    const folders = fs.readdirSync(TEMPLATE_DIR, { withFileTypes: true });

    const templates: ITemplateInfo[] = folders
      .filter((dirent) => dirent.isDirectory())
      .filter((dir) => dir.name !== "stase-default")
      .map((dir) => ({
        folder: dir.name,
        name: formatName(dir.name),
        description: `Template untuk ${formatName(dir.name)}`,
      }));

    return { templates };
  },
};
