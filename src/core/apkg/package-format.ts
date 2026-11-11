import type {PackageFormat} from "./types";

export interface CollectionSelection {
  entry: "collection.anki21b" | "collection.anki21" | "collection.anki2";
  format: PackageFormat;
  warnings: string[];
}

export function selectCollectionEntry(names: ReadonlySet<string>): CollectionSelection | null {
  if (names.has("collection.anki21b")) {
    return {
      entry: "collection.anki21b",
      format: "latest",
      warnings: names.has("collection.anki2")
        ? ["A legacy collection.anki2 compatibility database is also present. The importer correctly selected collection.anki21b."]
        : [],
    };
  }
  if (names.has("collection.anki21")) {
    return {
      entry: "collection.anki21",
      format: "legacy-2",
      warnings: names.has("collection.anki2")
        ? ["A collection.anki2 compatibility database is also present. The importer correctly selected collection.anki21."]
        : [],
    };
  }
  if (names.has("collection.anki2")) {
    return {entry:"collection.anki2",format:"legacy-1",warnings:[]};
  }
  return null;
}
