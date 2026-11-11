export const workflowSteps = [
  {id:"import",label:"Import"},{id:"inspect",label:"Inspect"},{id:"analyze",label:"Analyze"},
  {id:"organize",label:"Organize"},{id:"review",label:"Review"},{id:"validate",label:"Validate"},
  {id:"export",label:"Export"}
] as const;
export type WorkflowStepId = (typeof workflowSteps)[number]["id"];