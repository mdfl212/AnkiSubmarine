import {unzipSync} from "fflate";
import {decompress as zstdDecompress} from "fzstd";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import {readModernMediaManifest,readPackageVersion} from "./protobuf";
import {inspectCollectionDatabase} from "./collection-inspector";
import {inspectZipDirectory} from "./zip-preflight";
import type {ApkgInspectionSummary,DeckSummary,ImportWorkerMessage,ImportWorkerRequest,PackageFormat} from "./types";
const scope=self as unknown as {onmessage:((event:MessageEvent<ImportWorkerRequest>)=>void)|null;postMessage:(message:ImportWorkerMessage)=>void};
const MAX_UPLOAD_BYTES=350_000_000;
const SQLITE_MAGIC="SQLite format 3\0";
function progress(stage:string,percent:number){scope.postMessage({type:"progress",stage,percent});}
function decodeUtf8(bytes:Uint8Array){return new TextDecoder().decode(bytes);}
function isSqlite(bytes:Uint8Array){return bytes.length>=16&&decodeUtf8(bytes.subarray(0,16))===SQLITE_MAGIC;}
function decodeLegacyMedia(bytes:Uint8Array):string[]{
  try{const parsed:unknown=JSON.parse(decodeUtf8(bytes));if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error();
    return Object.values(parsed as Record<string,unknown>).filter((value):value is string=>typeof value==="string");
  }catch{throw new Error("The legacy media manifest is not valid JSON.");}
}
function decodeMediaManifest(bytes:Uint8Array,latest:boolean){
  if(latest)return readModernMediaManifest(zstdDecompress(bytes)).map(entry=>entry.name);
  return decodeLegacyMedia(bytes);
}
async function inspectDatabase(databaseBytes:Uint8Array,format:PackageFormat,filename:string,fileSize:number,entryCount:number,mediaCount:number,mediaManifestCount:number|null,warnings:string[]):Promise<ApkgInspectionSummary>{
  if(!isSqlite(databaseBytes))throw new Error("The selected collection entry did not decode to a valid SQLite database.");
  progress("Opening the collection database",72);
  const sqlite3=await sqlite3InitModule();
  const pointer=sqlite3.wasm.allocFromTypedArray(databaseBytes),db=new sqlite3.oo1.DB();
  try{
    const rc=sqlite3.capi.sqlite3_deserialize(db.pointer!,"main",pointer,databaseBytes.byteLength,databaseBytes.byteLength,sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE);
    db.checkRc(rc);db.exec("PRAGMA query_only=ON;");
    return inspectCollectionDatabase(db,{format,filename,fileSize,entryCount,mediaCount,mediaManifestCount,warnings});
  }finally{db.close();}
}
async function inspectFile(file:File):Promise<ApkgInspectionSummary>{
  if(!file.name.toLowerCase().endsWith(".apkg"))throw new Error("Please select an Anki package with the .apkg extension.");
  if(file.size===0)throw new Error("The selected APKG file is empty.");
  if(file.size>MAX_UPLOAD_BYTES)throw new Error("This initial importer accepts APKG files up to 350 MB. Larger-package streaming support is planned.");
  progress("Reading package",8);
  const input=new Uint8Array(await file.arrayBuffer());
  progress("Checking ZIP structure and safety",20);
  const directory=inspectZipDirectory(input),names=new Set(directory.map(entry=>entry.name));
  const collectionEntry=["collection.anki21b","collection.anki21","collection.anki2"].find(name=>names.has(name));
  if(!collectionEntry)throw new Error("No supported Anki collection database was found. Expected collection.anki21b, collection.anki21, or collection.anki2.");
  const format:PackageFormat=collectionEntry==="collection.anki21b"?"latest":collectionEntry==="collection.anki21"?"legacy-2":"legacy-1";
  const warnings:string[]=[];
  if(names.has("collection.anki21b")&&names.has("collection.anki2"))warnings.push("A legacy collection.anki2 compatibility database is also present. The importer correctly selected collection.anki21b.");
  else if(names.has("collection.anki21")&&names.has("collection.anki2"))warnings.push("A collection.anki2 compatibility database is also present. The importer correctly selected collection.anki21.");
  const metaEntry=directory.find(entry=>entry.name==="meta");
  if(metaEntry&&metaEntry.uncompressedSize>1024*1024)throw new Error("The package metadata entry is unexpectedly large.");
  progress("Extracting package entries",36);
  let archive:Record<string,Uint8Array>;
  try{archive=unzipSync(input);}catch(error){throw new Error(`The APKG ZIP archive could not be extracted: ${error instanceof Error?error.message:"unknown ZIP error"}`);}
  let databaseBytes=archive[collectionEntry]!;
  if(format==="latest"){
    progress("Decompressing the modern Zstandard collection",52);
    try{databaseBytes=zstdDecompress(databaseBytes);}catch(error){throw new Error(`The collection.anki21b Zstandard stream could not be decoded: ${error instanceof Error?error.message:"unknown Zstandard error"}`);}
  }
  let mediaNames:string[]=[];
  if(archive.media){try{mediaNames=decodeMediaManifest(archive.media,format==="latest");}
    catch(error){warnings.push(error instanceof Error?error.message:"The media manifest could not be decoded.");}}
  else warnings.push("The package has no media manifest.");
  const numericEntries=directory.filter(entry=>/^\d+$/.test(entry.name));
  if(mediaNames.length&&mediaNames.length!==numericEntries.length)warnings.push(`The media manifest lists ${mediaNames.length} files, while the archive contains ${numericEntries.length} numbered media entries.`);
  const packageVersion=archive.meta?readPackageVersion(archive.meta):null;
  if(packageVersion!==null&&((format==="latest"&&packageVersion!==3)||(format==="legacy-2"&&packageVersion!==2)))warnings.push("The package metadata version does not match the selected collection entry; collection entry precedence was used.");
  if(!archive.meta&&format==="latest")warnings.push("The modern collection entry has no package metadata record.");
  progress("Inspecting collection tables",68);
  return inspectDatabase(databaseBytes,format,file.name,file.size,directory.length,numericEntries.length,archive.media?mediaNames.length:null,warnings);
}
scope.onmessage=async(event)=>{
  try{const summary=await inspectFile(event.data.file);progress("Inspection complete",100);scope.postMessage({type:"success",summary});}
  catch(error){scope.postMessage({type:"error",message:error instanceof Error?error.message:"An unexpected APKG inspection error occurred."});}
};