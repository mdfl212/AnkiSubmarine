export function decodeLegacyMediaManifest(bytes:Uint8Array):string[]{
  try{
    const parsed:unknown=JSON.parse(new TextDecoder().decode(bytes));
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error();
    return Object.values(parsed as Record<string,unknown>).filter((value):value is string=>typeof value==="string");
  }catch{
    throw new Error("The legacy media manifest is not valid JSON.");
  }
}
