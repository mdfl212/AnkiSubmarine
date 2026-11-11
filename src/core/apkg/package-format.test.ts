import {describe,expect,it} from "vitest";
import {selectCollectionEntry} from "./package-format";

describe("Anki collection entry selection",()=>{
  it("selects collection.anki21 over the legacy compatibility stub",()=>{
    expect(selectCollectionEntry(new Set(["collection.anki21","collection.anki2","media"]))).toEqual({
      entry:"collection.anki21",
      format:"legacy-2",
      warnings:["A collection.anki2 compatibility database is also present. The importer correctly selected collection.anki21."]
    });
  });
  it("prefers the modern collection.anki21b entry when present",()=>{
    expect(selectCollectionEntry(new Set(["collection.anki21b","collection.anki21","collection.anki2"]))).toMatchObject({
      entry:"collection.anki21b",format:"latest"
    });
  });
  it("supports a package containing only collection.anki2",()=>{
    expect(selectCollectionEntry(new Set(["collection.anki2"]))).toEqual({entry:"collection.anki2",format:"legacy-1",warnings:[]});
  });
  it("returns null when no collection entry exists",()=>{
    expect(selectCollectionEntry(new Set(["media","meta"]))).toBeNull();
  });
});
