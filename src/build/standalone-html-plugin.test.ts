import {describe,expect,it} from "vitest";
import type {OutputBundle} from "rollup";
import {inlineStandaloneHtml} from "./standalone-html-plugin";

function bundle():OutputBundle{
  return ({
    "assets/app.js":{type:"chunk",fileName:"assets/app.js",name:"app",isEntry:true,isImplicitEntry:false,moduleIds:[],facadeModuleId:"/src/main.tsx",isDynamicEntry:false,imports:[],dynamicImports:[],implicitlyLoadedBefore:[],referencedFiles:[],exports:[],modules:{},code:"const ready = true;",map:null},
    "assets/app.css":{type:"asset",fileName:"assets/app.css",name:"app.css",source:"body { color: white; }"}
  }) as unknown as OutputBundle;
}

describe("standalone HTML build",()=>{
  it("inlines the application script and stylesheet into index.html",()=>{
    const html='<html><head><link rel="modulepreload" crossorigin href="./assets/app.js"><link rel="stylesheet" crossorigin href="./assets/app.css"></head><body><script type="module" crossorigin src="./assets/app.js"></script></body></html>';
    const output=inlineStandaloneHtml(html,bundle());
    expect(output).toContain("<style>");
    expect(output).toContain("body { color: white; }");
    expect(output).toContain("<script type=\"module\">");
    expect(output).toContain("const ready = true;");
    expect(output).not.toContain("./assets/");
    expect(output).not.toContain("modulepreload");
  });

  it("rejects JavaScript chunks that still depend on external chunks",()=>{
    const assets=bundle();
    const app=assets["assets/app.js"];
    if(app?.type==="chunk")app.imports.push("assets/vendor.js");
    expect(()=>inlineStandaloneHtml('<script type="module" src="./assets/app.js"></script>',assets)).toThrow(/external JavaScript chunk dependency/);
  });

  it("fails rather than emitting HTML with unresolved asset references",()=>{
    expect(()=>inlineStandaloneHtml('<script type="module" src="./assets/missing.js"></script>',{})).toThrow(/could not find JavaScript chunk/);
  });

  it("rejects remote scripts, stylesheets, and CSS imports",()=>{
    expect(()=>inlineStandaloneHtml('<script src="https://cdn.example/app.js"></script>',{})).toThrow(/external network resources/);
    expect(()=>inlineStandaloneHtml('<style>@import url(https://fonts.example/font.css);</style>',{})).toThrow(/external network resources/);
  });
});
