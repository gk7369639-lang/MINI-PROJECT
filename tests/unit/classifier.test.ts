import { describe, it, expect } from "vitest";
import { classifierAgent } from "@/lib/ai/classifier";
import { db } from "@/lib/data/store";

describe("Query Classifier Agent Unit Tests", () => {
  const categories = db.getCategories();
  const departments = db.getDepartments();

  it("correctly classifies attendance medical condonation queries with high priority", async () => {
    const result = await classifierAgent.classifyTicket(
      "Hospitalization leave for dengue fever",
      "I was admitted to hospital for 7 days with dengue and my attendance dropped below 75%",
      categories,
      departments
    );

    expect(result.suggested_category_name).toContain("Attendance");
    expect(result.suggested_department_name).toContain("Academic");
    expect(result.suggested_priority).toBe("HIGH");
    expect(result.confidence_score).toBeGreaterThan(0.6);
  });

  it("correctly identifies fee payment queries and recommends financial cross-checks", async () => {
    const result = await classifierAgent.classifyTicket(
      "Fee payment deducted but receipt pending",
      "My HDFC bank account debited Rs 65000 with transaction ref UTR94819 but portal still shows pending",
      categories,
      departments
    );

    expect(result.suggested_department_name).toContain("Accounts");
    expect(result.recommended_next_action).toContain("settlement log");
  });

  it("correctly identifies campus wifi issues and maps to Campus IT Support", async () => {
    const result = await classifierAgent.classifyTicket(
      "Cannot connect MacBook to campus WiFi",
      "My device MAC address is 3C:22:FB:49:10:9A and I need access to eduroam and student 5G",
      categories,
      departments
    );

    expect(result.suggested_department_name).toContain("IT");
    expect(result.recommended_next_action).toContain("RADIUS");
  });
});
