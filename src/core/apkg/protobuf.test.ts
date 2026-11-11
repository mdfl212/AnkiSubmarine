import {describe,expect,it} from "vitest";
import {readModernMediaManifest,readPackageVersion,readProtoFields} from "./protobuf";
describe("Anki package protobuf decoding",()=>{
  it("reads the package version field",()=>expect(readPackageVersion(new Uint8Array([0x08,0x03]))).toBe(3));
  it("decodes modern media entry names and sizes",()=>{
    const name=new TextEncoder().encode("diagram.png");
    const entry=new Uint8Array([0x0a,name.length,...name,0x10,0x7b]);
    const manifest=new Uint8Array([0x0a,entry.length,...entry]);
    expect(readModernMediaManifest(manifest)).toEqual([{name:"diagram.png",size:123}]);
  });
  it("rejects malformed varints and truncated fields",()=>{
    expect(()=>readProtoFields(new Uint8Array([0x80]))).toThrow(/varint/);
    expect(()=>readProtoFields(new Uint8Array([0x0a,0x05,0x01]))).toThrow(/field length/);
  });
});