import {describe,expect,it} from "vitest";
import {createOfflineWorkerSource} from "./offline-cache-plugin";

describe("offline application shell",()=>{
  it("pre-caches the app shell and every emitted asset",()=>{
    const source=createOfflineWorkerSource(["assets/app.js","assets/app.css","assets/sqlite.wasm"]);
    expect(source).toContain('"/"');
    expect(source).toContain('"/index.html"');
    expect(source).toContain('"/assets/app.js"');
    expect(source).toContain('"/assets/app.css"');
    expect(source).toContain('"/assets/sqlite.wasm"');
  });

  it("uses a versioned cache and falls back to the cached app shell offline",()=>{
    const source=createOfflineWorkerSource(["assets/app.js"],"test-build");
    expect(source).toContain('ankisubmarine-shell-test-build');
    expect(source).toContain('caches.match("/index.html")');
    expect(source).toContain('request.mode === "navigate"');
  });

  it("does not intercept cross-origin requests or non-GET requests",()=>{
    const source=createOfflineWorkerSource([]);
    expect(source).toContain('if (request.method !== "GET") return;');
    expect(source).toContain('if (url.origin !== self.location.origin) return;');
  });
});
