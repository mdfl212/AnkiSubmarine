import {describe,expect,it} from "vitest";
import {decodeLegacyMediaManifest} from "./media-manifest";

describe("legacy Anki media manifest",()=>{
  it("reads filename values from the numeric-key JSON map",()=>{
    const bytes=new TextEncoder().encode(JSON.stringify({"0":"lesion.jpg","1":"diagram.png"}));
    expect(decodeLegacyMediaManifest(bytes)).toEqual(["lesion.jpg","diagram.png"]);
  });
  it("rejects malformed or non-object manifests",()=>{
    expect(()=>decodeLegacyMediaManifest(new TextEncoder().encode("not json"))).toThrow(/not valid JSON/);
    expect(()=>decodeLegacyMediaManifest(new TextEncoder().encode("[]"))).toThrow(/not valid JSON/);
  });
});
