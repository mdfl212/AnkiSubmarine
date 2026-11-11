import {describe,expect,it} from "vitest";
import {zipSync,strToU8} from "fflate";
import {inspectZipDirectory} from "./zip-preflight";
describe("ZIP preflight",()=>{
  it("lists normal package entries and their sizes",()=>{
    const bytes=zipSync({"collection.anki2":strToU8("sqlite"),media:strToU8("{}"),"0":strToU8("image")});
    const entries=inspectZipDirectory(bytes);
    expect(entries.map(entry=>entry.name)).toEqual(["0","collection.anki2","media"]);
    expect(entries.find(entry=>entry.name==="collection.anki2")?.uncompressedSize).toBe(6);
  });
  it("rejects a non-ZIP input",()=>expect(()=>inspectZipDirectory(strToU8("not a zip"))).toThrow(/valid ZIP/));
  it("rejects unsafe archive paths",()=>{
    const bytes=zipSync({"../escape.txt":strToU8("bad")});
    expect(()=>inspectZipDirectory(bytes)).toThrow(/unsafe file path/);
  });
  it("rejects archives exceeding configured entry limits",()=>{
    const bytes=zipSync({"one":strToU8("1"),"two":strToU8("2")});
    expect(()=>inspectZipDirectory(bytes,{maxEntries:1,maxExpandedBytes:100,maxEntryBytes:100,maxCompressionRatio:100})).toThrow(/too many entries/);
  });
});