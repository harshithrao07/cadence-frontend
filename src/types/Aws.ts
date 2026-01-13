export interface SaveFileDTO {
  category: string;
  subCategory: string;
  name: string;
  extension: string;
}

export interface FileWithMetadata {
  file: FormData;
  tableName: string;
  columnName: string;
  primaryKey: string;
}

export interface FileUploadResult {
  tableName: string;
  columnName: string;
  primaryKey: string;
  url: string;
}
