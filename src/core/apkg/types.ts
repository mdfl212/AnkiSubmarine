export type PackageFormat = "legacy-1" | "legacy-2" | "latest";
export interface DeckSummary {id?:string;name:string}
export interface ApkgInspectionSummary {
  filename:string;fileSize:number;packageFormat:PackageFormat;collectionEntry:string;
  schemaVersion:number|null;sqliteUserVersion:number|null;noteCount:number;cardCount:number;
  deckCount:number;noteTypeCount:number;tagCount:number;mediaCount:number;
  mediaManifestCount:number|null;archiveEntryCount:number;decks:DeckSummary[];
  tables:string[];integrity:"ok"|"failed"|"not-checked";warnings:string[];
}
export type ImportWorkerMessage =
  | {type:"progress";stage:string;percent:number}
  | {type:"success";summary:ApkgInspectionSummary}
  | {type:"error";message:string};
export type ImportWorkerRequest = {file:File};