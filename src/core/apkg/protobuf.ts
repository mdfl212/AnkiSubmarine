export interface ProtoField {number:number;wireType:number;value:number|bigint|Uint8Array}
function readVarint(bytes:Uint8Array,start:number):{value:bigint;next:number}{
  let value=0n,shift=0n,index=start;
  for(;index<bytes.length&&index-start<10;index++){
    const byte=bytes[index]!;value|=BigInt(byte&0x7f)<<shift;
    if((byte&0x80)===0)return {value,next:index+1};shift+=7n;
  }
  throw new Error("Malformed Protocol Buffer: invalid varint.");
}
export function readProtoFields(bytes:Uint8Array):ProtoField[]{
  const fields:ProtoField[]=[];let offset=0;
  while(offset<bytes.length){
    const key=readVarint(bytes,offset);offset=key.next;
    const number=Number(key.value>>3n),wireType=Number(key.value&7n);
    if(number===0)throw new Error("Malformed Protocol Buffer: field number 0.");
    if(wireType===0){
      const item=readVarint(bytes,offset);offset=item.next;
      fields.push({number,wireType,value:item.value<=BigInt(Number.MAX_SAFE_INTEGER)?Number(item.value):item.value});
    }else if(wireType===1){
      if(offset+8>bytes.length)throw new Error("Malformed Protocol Buffer: truncated fixed64.");
      fields.push({number,wireType,value:bytes.slice(offset,offset+8)});offset+=8;
    }else if(wireType===2){
      const length=readVarint(bytes,offset);offset=length.next;const size=Number(length.value);
      if(!Number.isSafeInteger(size)||size<0||offset+size>bytes.length)throw new Error("Malformed Protocol Buffer: invalid field length.");
      fields.push({number,wireType,value:bytes.slice(offset,offset+size)});offset+=size;
    }else if(wireType===5){
      if(offset+4>bytes.length)throw new Error("Malformed Protocol Buffer: truncated fixed32.");
      fields.push({number,wireType,value:bytes.slice(offset,offset+4)});offset+=4;
    }else throw new Error("Malformed Protocol Buffer: unsupported wire type.");
  }
  return fields;
}
export function readPackageVersion(bytes:Uint8Array):number|null{
  const field=readProtoFields(bytes).find(item=>item.number===1&&item.wireType===0);
  return typeof field?.value==="number"?field.value:null;
}
export interface ModernMediaEntry {name:string;size:number|null}
export function readModernMediaManifest(bytes:Uint8Array):ModernMediaEntry[]{
  return readProtoFields(bytes).filter(field=>field.number===1&&field.wireType===2&&field.value instanceof Uint8Array)
    .map(field=>{
      const entry=readProtoFields(field.value as Uint8Array);
      const nameField=entry.find(item=>item.number===1&&item.wireType===2&&item.value instanceof Uint8Array);
      const sizeField=entry.find(item=>item.number===2&&item.wireType===0);
      const name=nameField?.value instanceof Uint8Array?new TextDecoder().decode(nameField.value):"";
      if(!name||name.includes("\\")||name.split("/").includes(".."))throw new Error("The modern media manifest contains an invalid filename.");
      return {name,size:typeof sizeField?.value==="number"?sizeField.value:null};
    });
}