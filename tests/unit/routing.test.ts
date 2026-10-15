import { describe, it, expect } from "vitest";
import { SmartRoutingAgent } from "@/lib/ai/routing";
import { db } from "@/lib/data/store";

describe("Smart Routing Agent Unit Tests", () => {
  const router = new SmartRoutingAgent();

  it("routes query to correct department faculty member", () => {
    const existing = db.getTickets();
    const result = router.routeTicket("dept-acad", "HIGH", existing);

    expect(result.recommended_department_id).toBe("dept-acad");
    expect(result.recommended_department_name).toBe("Academic Affairs & Registry");
    expect(result.recommended_staff_id).toBeDefined();
    expect(result.is_auto_assigned).toBe(true);
  });

  it("gracefully falls back to department intake queue when no individual staff is available", () => {
    const result = router.routeTicket("dept-hostel", "MEDIUM", []);
    expect(result.recommended_department_id).toBe("dept-hostel");
    expect(result.is_auto_assigned).toBe(false);
    expect(result.routing_reason).toContain("departmental queue");
  });
});
