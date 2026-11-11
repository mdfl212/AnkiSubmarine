import type {OutputBundle} from "rollup";
import type {Plugin} from "vite";

function assetPath(source:string):string{
  return decodeURIComponent(source.split("?")[0]!).replace(/^\.\//,"").replace(/^\/+/, "");
}

function sourceText(source:string|Uint8Array):string{
  return typeof source==="string"?source:new TextDecoder().decode(source);
}

/**
 * Rewrites Vite's generated HTML so its JavaScript and CSS are embedded directly
 * in index.html. This makes the production entry point usable from file://.
 */
export function inlineStandaloneHtml(html:string,bundle:OutputBundle):string{
  if(/<(?:script|link)\b[^>]*(?:src|href)=["'](?:https?:)?\/\//i.test(html)||/@import\s+(?:url\()?["']?https?:\/\//i.test(html)||/url\(["']?https?:\/\//i.test(html)){
    throw new Error("Standalone HTML must not load external network resources.");
  }
  let output=html.replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi,"");

  output=output.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi,(_tag,path:string)=>{
    const item=bundle[assetPath(path)];
    if(!item||item.type!=="chunk")throw new Error(`Standalone build could not find JavaScript chunk: ${path}`);
    if(item.imports.length||item.dynamicImports.length)throw new Error(`Standalone build found an external JavaScript chunk dependency in ${path}`);
    return `<script type="module">\n${item.code.replace(/<\/script/gi,"<\\/script")}\n</script>`;
  });

  output=output.replace(/<link\b(?=[^>]*\brel=["']stylesheet["'])[^>]*\bhref=["']([^"']+)["'][^>]*>/gi,(_tag,path:string)=>{
    const item=bundle[assetPath(path)];
    if(!item||item.type!=="asset")throw new Error(`Standalone build could not find stylesheet: ${path}`);
    return `<style>\n${sourceText(item.source).replace(/<\/style/gi,"<\\/style")}\n</style>`;
  });

  if(/<(?:script|link)\b[^>]*(?:src|href)=["'](?:\.\/|\/)?assets\//i.test(output)){
    throw new Error("Standalone HTML still references an external build asset.");
  }
  return output;
}

export function standaloneHtmlPlugin():Plugin{
  return {
    name:"ankisubmarine-standalone-html",
    apply:"build",
    enforce:"post",
    generateBundle(_options,bundle){
      const htmlAsset=bundle["index.html"];
      if(!htmlAsset||htmlAsset.type!=="asset")throw new Error("Standalone build is missing index.html.");
      htmlAsset.source=inlineStandaloneHtml(sourceText(htmlAsset.source),bundle);
    }
  };
}
