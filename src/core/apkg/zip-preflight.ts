export interface ZipEntryInfo {name:string;compressedSize:number;uncompressedSize:number;compressionMethod:number;encrypted:boolean}
export interface ZipLimits {maxEntries:number;maxExpandedBytes:number;maxEntryBytes:number;maxCompressionRatio:number}
export const DEFAULT_ZIP_LIMITS:ZipLimits={maxEntries:50000,maxExpandedBytes:750_000_000,maxEntryBytes:350_000_000,maxCompressionRatio:1000};
const EOCD=0x06054b50,CENTRAL=0x02014b50;
function findEndRecord(view:DataView):number{
  const min=Math.max(0,view.byteLength-65557);
  for(let i=view.byteLength-22;i>=min;i--)if(view.getUint32(i,true)===EOCD)return i;
  throw new Error("This file is not a valid ZIP archive (end record not found).");
}
export function inspectZipDirectory(bytes:Uint8Array,limits:ZipLimits=DEFAULT_ZIP_LIMITS):ZipEntryInfo[]{
  if(bytes.byteLength<22)throw new Error("The selected file is too small to be an APKG archive.");
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),end=findEndRecord(view);
  const disk=view.getUint16(end+4,true),centralDisk=view.getUint16(end+6,true);
  const entriesOnDisk=view.getUint16(end+8,true),entryCount=view.getUint16(end+10,true);
  const centralSize=view.getUint32(end+12,true),centralOffset=view.getUint32(end+16,true);
  if(disk!==0||centralDisk!==0||entriesOnDisk!==entryCount)throw new Error("Multi-disk ZIP archives are not supported.");
  if(entryCount===0xffff||centralSize===0xffffffff||centralOffset===0xffffffff)throw new Error("ZIP64 packages are not supported by this import build yet.");
  if(entryCount>limits.maxEntries)throw new Error(`The archive contains too many entries (limit: ${limits.maxEntries.toLocaleString()}).`);
  if(centralOffset+centralSize>end||centralOffset+centralSize>bytes.byteLength)throw new Error("The ZIP central directory is incomplete or corrupt.");
  const decoder=new TextDecoder("utf-8",{fatal:false}),entries:ZipEntryInfo[]=[];
  const names=new Set<string>();let offset=centralOffset,totalExpanded=0;
  for(let index=0;index<entryCount;index++){
    if(offset+46>bytes.byteLength||view.getUint32(offset,true)!==CENTRAL)throw new Error("The ZIP central directory contains an invalid entry.");
    const flags=view.getUint16(offset+8,true),method=view.getUint16(offset+10,true);
    const compressedSize=view.getUint32(offset+20,true),uncompressedSize=view.getUint32(offset+24,true);
    const nameLength=view.getUint16(offset+28,true),extraLength=view.getUint16(offset+30,true),commentLength=view.getUint16(offset+32,true);
    const next=offset+46+nameLength+extraLength+commentLength;
    if(next>bytes.byteLength)throw new Error("The ZIP central directory entry is truncated.");
    const name=decoder.decode(bytes.subarray(offset+46,offset+46+nameLength));
    const normalized=name.replace(/\\/g,"/");
    if(!normalized||normalized.startsWith("/")||/^[A-Za-z]:/.test(normalized)||normalized.split("/").some(part=>part===".."||part==="."))throw new Error("The archive contains an unsafe file path.");
    if(names.has(normalized))throw new Error(`The archive contains a duplicate entry: ${normalized}`);
    names.add(normalized);
    if((flags&1)!==0)throw new Error("Encrypted ZIP entries are not supported.");
    if(method!==0&&method!==8)throw new Error(`Unsupported ZIP compression method ${method} in ${normalized}.`);
    if(uncompressedSize>limits.maxEntryBytes)throw new Error(`Archive entry exceeds the per-file safety limit: ${normalized}`);
    totalExpanded+=uncompressedSize;
    if(totalExpanded>limits.maxExpandedBytes)throw new Error("The expanded archive exceeds the import safety limit.");
    if(uncompressedSize>0&&compressedSize===0)throw new Error(`Invalid compressed size for archive entry: ${normalized}`);
    if(compressedSize>0&&uncompressedSize/compressedSize>limits.maxCompressionRatio)throw new Error(`Suspicious compression ratio in archive entry: ${normalized}`);
    entries.push({name:normalized,compressedSize,uncompressedSize,compressionMethod:method,encrypted:false});offset=next;
  }
  if(offset>centralOffset+centralSize)throw new Error("The ZIP central directory length is inconsistent.");
  return entries;
}