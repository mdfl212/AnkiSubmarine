import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

const serviceWorkerOriginSupported=window.location.protocol==="https:"||
  (window.location.protocol==="http:"&&(window.location.hostname==="localhost"||window.location.hostname==="127.0.0.1"));

if(import.meta.env.PROD&&serviceWorkerOriginSupported&&"serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    void navigator.serviceWorker.register("./sw.js").catch(error=>{
      console.error("AnkiSubmarine optional browser cache could not be registered.",error);
    });
  },{once:true});
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
