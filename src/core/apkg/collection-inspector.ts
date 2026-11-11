import type {ApkgInspectionSummary,DeckSummary,PackageFormat} from "./types";
export interface CollectionInspectionInput {
  format:PackageFormat;filename:string;fileSize:number;entryCount:number;mediaCount:number;
  mediaManifestCount:number|null;warnings:string[];
}
function tableRows(db:any,sql:string):any[]{return db.exec({sql,rowMode:"object",returnValue:"resultRows"}) as any[];}
function countRows(db:any,table:string):number{return Number(tableRows(db,`SELECT COUNT(*) AS count FROM "${table}"`)[0]?.count??0);}
function parseLegacyJson(value:unknown):Record<string,any>{
  if(typeof value!=="string")return {};
  try{const parsed=JSON.parse(value);return parsed&&typeof parsed==="object"?parsed:{};}catch{return {};}
}
export function inspectCollectionDatabase(db:any,input:CollectionInspectionInput):ApkgInspectionSummary{
  const tableNames=tableRows(db,"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").map(row=>String(row.name));
  const tables=new Set(tableNames);
  if(!tables.has("notes")||!tables.has("cards"))throw new Error("The collection database is missing the expected Anki notes or cards table.");
  const integrityRow=tableRows(db,"PRAGMA quick_check(1)")[0];
  const integrity=String(integrityRow?.quick_check??Object.values(integrityRow??{})[0]??"")==="ok"?"ok":"failed";
  if(integrity==="failed")input.warnings.push("SQLite quick_check reported a database integrity issue.");
  const noteCount=countRows(db,"notes"),cardCount=countRows(db,"cards");
  const pragma=tableRows(db,"PRAGMA user_version")[0],sqliteUserVersion=Number(Object.values(pragma??{})[0]??0);
  let decks:DeckSummary[]=[];
  if(tables.has("decks")){
    const columns=tableRows(db,'PRAGMA table_info("decks")').map(row=>String(row.name));
    if(columns.includes("name")){
      const select=columns.includes("id")?"id,name":"name";
      decks=tableRows(db,`SELECT ${select} FROM decks ORDER BY name`).map(row=>({id:row.id===undefined?undefined:String(row.id),name:String(row.name)}));
    }
  }
  let noteTypeCount=tables.has("notetypes")?countRows(db,"notetypes"):0;
  if(tables.has("col")){
    const colColumns=tableRows(db,'PRAGMA table_info("col")').map(row=>String(row.name));
    const legacyFields=["decks","models"].filter(name=>colColumns.includes(name));
    if(legacyFields.length){
      const col=tableRows(db,`SELECT ${legacyFields.map(name=>`"${name}"`).join(",")} FROM col LIMIT 1`)[0]??{};
      if(!decks.length&&typeof col.decks==="string"){
        const parsed=parseLegacyJson(col.decks);
        decks=Object.entries(parsed).filter(([,item])=>item&&typeof item.name==="string")
          .map(([id,item])=>({id:String(item.id??id),name:String(item.name)}));
      }
      if(!noteTypeCount&&typeof col.models==="string")noteTypeCount=Object.keys(parseLegacyJson(col.models)).length;
    }
  }
  const tagSet=new Set<string>(),noteColumns=tableRows(db,'PRAGMA table_info("notes")').map(row=>String(row.name));
  if(noteColumns.includes("tags"))db.exec({sql:"SELECT tags FROM notes",rowMode:"object",callback:(row:any)=>{
    if(typeof row.tags==="string")for(const tag of row.tags.trim().split(/\s+/))if(tag)tagSet.add(tag);
  }});
  const schemaVersion=tables.has("col")&&tableRows(db,'PRAGMA table_info("col")').some(row=>row.name==="ver")
    ?Number(tableRows(db,"SELECT ver FROM col LIMIT 1")[0]?.ver??0):null;
  if(!decks.length)input.warnings.push("Deck definitions could not be read from the detected collection schema.");
  if(!noteTypeCount)input.warnings.push("Note type definitions were not found in the expected collection tables.");
  return {filename:input.filename,fileSize:input.fileSize,packageFormat:input.format,
    collectionEntry:input.format==="latest"?"collection.anki21b":input.format==="legacy-2"?"collection.anki21":"collection.anki2",
    schemaVersion:schemaVersion!==null&&Number.isFinite(schemaVersion)?schemaVersion:null,
    sqliteUserVersion:Number.isFinite(sqliteUserVersion)?sqliteUserVersion:null,
    noteCount,cardCount,deckCount:decks.length,noteTypeCount,tagCount:tagSet.size,mediaCount:input.mediaCount,
    mediaManifestCount:input.mediaManifestCount,archiveEntryCount:input.entryCount,decks,tables:tableNames,integrity,warnings:input.warnings};
}
