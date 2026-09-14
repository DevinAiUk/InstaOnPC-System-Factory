import type { FactoryProject } from "../factory/model";
import { packageFiles } from "../factory/export";
export type AdapterName =
  | "google-drive"
  | "google-docs"
  | "notion"
  | "hubspot"
  | "make"
  | "n8n"
  | "zapier";
export interface DeliveryPlan {
  adapter: AdapterName;
  mode: "mock";
  status: "prepared";
  executed: false;
  requiresApproval: true;
  destination: string;
  files: string[];
  payload: unknown;
}
export interface IntegrationAdapter {
  prepare(project: FactoryProject): Promise<DeliveryPlan>;
  execute(plan: DeliveryPlan): Promise<never>;
}
export function mockAdapter(adapter: AdapterName): IntegrationAdapter {
  return {
    async prepare(p) {
      return {
        adapter,
        mode: "mock",
        status: "prepared",
        executed: false,
        requiresApproval: true,
        destination: "Operator must select and verify destination",
        files: Object.keys(packageFiles(p)),
        payload:
          adapter === "hubspot"
            ? {
                objectType: "contacts",
                mapping: { email: "lead.email", firstname: "lead.name" },
                connection: "unconfigured",
                consent: "required",
              }
            : { projectId: p.id, draftOnly: true },
      };
    },
    async execute() {
      throw new Error(
        "Mock adapter cannot write externally. Implement a server-authorized, idempotent connector with approval for the exact destination and payload.",
      );
    },
  };
}
