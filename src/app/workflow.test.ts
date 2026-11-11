import {describe,expect,it} from "vitest";
import {workflowSteps} from "./workflow";
describe("workflow definition",()=>{
  it("exposes the seven stages in the intended order",()=>{
    expect(workflowSteps.map(step=>step.id)).toEqual(["import","inspect","analyze","organize","review","validate","export"]);
  });
  it("uses unique step identifiers",()=>{
    const ids=workflowSteps.map(step=>step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});