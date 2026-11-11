import type {ApkgInspectionSummary,ImportWorkerMessage} from "./types";
export function inspectApkg(file:File,onProgress:(stage:string,percent:number)=>void):Promise<ApkgInspectionSummary>{
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL("./inspect.worker.ts",import.meta.url),{type:"module"});let settled=false;
    const finish=()=>{if(!settled){settled=true;worker.terminate();}};
    worker.onmessage=(event:MessageEvent<ImportWorkerMessage>)=>{
      const message=event.data;
      if(message.type==="progress")onProgress(message.stage,message.percent);
      else if(message.type==="success"){finish();resolve(message.summary);}
      else{finish();reject(new Error(message.message));}
    };
    worker.onerror=event=>{finish();reject(new Error(event.message||"The APKG inspection worker failed."));};
    worker.postMessage({file});
  });
}