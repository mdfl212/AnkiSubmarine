import {beforeAll,describe,expect,it} from "vitest";
import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import {inspectCollectionDatabase} from "./collection-inspector";
let sqlite3:any;
beforeAll(async()=>{sqlite3=await sqlite3InitModule();});
function makeDb(sql:string){
  const db=new sqlite3.oo1.DB();db.exec(sql);db.exec("PRAGMA query_only=ON;");return db;
}
describe("SQLite collection inspection",()=>{
  it("reads normalized collection tables and distinct note tags",()=>{
    const db=makeDb(`
      CREATE TABLE notes(id INTEGER PRIMARY KEY,tags TEXT);
      CREATE TABLE cards(id INTEGER PRIMARY KEY);
      CREATE TABLE decks(id INTEGER PRIMARY KEY,name TEXT);
      CREATE TABLE notetypes(id INTEGER PRIMARY KEY,name TEXT);
      CREATE TABLE col(id INTEGER PRIMARY KEY,ver INTEGER);
      INSERT INTO col(id,ver) VALUES(1,18);
      INSERT INTO notes(id,tags) VALUES(1,'alpha beta'),(2,'beta gamma');
      INSERT INTO cards(id) VALUES(1),(2),(3);
      INSERT INTO decks(id,name) VALUES(1,'Default'),(2,'Dermatology::Pathology');
      INSERT INTO notetypes(id,name) VALUES(1,'Basic'),(2,'Cloze');
      PRAGMA user_version=18;
    `);
    try{
      const summary=inspectCollectionDatabase(db,{format:"latest",filename:"fixture.apkg",fileSize:1234,entryCount:5,mediaCount:2,mediaManifestCount:2,warnings:[]});
      expect(summary.noteCount).toBe(2);expect(summary.cardCount).toBe(3);
      expect(summary.deckCount).toBe(2);expect(summary.noteTypeCount).toBe(2);expect(summary.tagCount).toBe(3);
      expect(summary.schemaVersion).toBe(18);expect(summary.sqliteUserVersion).toBe(18);
      expect(summary.integrity).toBe("ok");expect(summary.decks.map(deck=>deck.name)).toContain("Dermatology::Pathology");
    }finally{db.close();}
  });
  it("reads legacy deck and model JSON from the collection row",()=>{
    const db=makeDb(`
      CREATE TABLE notes(id INTEGER PRIMARY KEY,tags TEXT);
      CREATE TABLE cards(id INTEGER PRIMARY KEY);
      CREATE TABLE col(id INTEGER PRIMARY KEY,ver INTEGER,decks TEXT,models TEXT);
      INSERT INTO col(id,ver,decks,models) VALUES(1,11,
        '{"1":{"name":"Default"},"2":{"name":"Biology::Cells"}}',
        '{"10":{"name":"Basic"},"11":{"name":"Cloze"}}');
      INSERT INTO notes(id,tags) VALUES(1,'legacy tag');
      INSERT INTO cards(id) VALUES(1);
      PRAGMA user_version=11;
    `);
    try{
      const summary=inspectCollectionDatabase(db,{format:"legacy-1",filename:"legacy.apkg",fileSize:456,entryCount:3,mediaCount:0,mediaManifestCount:0,warnings:[]});
      expect(summary.noteCount).toBe(1);expect(summary.cardCount).toBe(1);
      expect(summary.deckCount).toBe(2);expect(summary.noteTypeCount).toBe(2);expect(summary.tagCount).toBe(2);
      expect(summary.schemaVersion).toBe(11);expect(summary.integrity).toBe("ok");
    }finally{db.close();}
  });
});