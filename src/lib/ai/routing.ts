import { AIRoutingResult, Department, Profile, Ticket } from "@/types";
import { db } from "@/lib/data/store";

export class SmartRoutingAgent {
  public routeTicket(
    departmentId: string,
    priority: string,
    existingTickets: Ticket[]
  ): AIRoutingResult {
    const dept = db.getDepartmentById(departmentId);
    if (!dept) {
      return {
        recommended_department_id: departmentId,
        recommended_department_name: "General Administration",
        recommended_staff_id: null,
        recommended_staff_name: null,
        routing_reason: "Department metadata not found; routed to central intake queue.",
        is_auto_assigned: false,
      };
    }

    // Find eligible staff members for this department
    const eligibleStaff = db
      .getProfiles()
      .filter((p) => p.is_active && (p.role === "STAFF" || p.role === "DEPARTMENT_HEAD") && p.department_id === dept.id);

    if (eligibleStaff.length === 0) {
      // Fallback to department queue without specific staff assigned
      return {
        recommended_department_id: dept.id,
        recommended_department_name: dept.name,
        recommended_staff_id: null,
        recommended_staff_name: null,
        routing_reason: `No individual staff assigned; ticket routed to ${dept.name} departmental queue for manual pickup.`,
        is_auto_assigned: false,
      };
    }

    // Calculate current active workload per staff member
    const workloadMap = new Map<string, number>();
    for (const staff of eligibleStaff) {
      workloadMap.set(staff.id, 0);
    }

    for (const t of existingTickets) {
      if (t.assigned_to && workloadMap.has(t.assigned_to)) {
        if (!["RESOLVED", "CLOSED", "REJECTED"].includes(t.status)) {
          workloadMap.set(t.assigned_to, (workloadMap.get(t.assigned_to) || 0) + 1);
        }
      }
    }

    // Find staff with lowest active load (prioritizing STAFF over DEPARTMENT_HEAD)
    let selectedStaff: Profile | null = null;
    let minLoad = Infinity;

    for (const staff of eligibleStaff) {
      // Prefer dedicated STAFF before assigning to DEPARTMENT_HEAD
      const weight = staff.role === "DEPARTMENT_HEAD" ? 2 : 0;
      const load = (workloadMap.get(staff.id) || 0) + weight;

      if (load < minLoad) {
        minLoad = load;
        selectedStaff = staff;
      }
    }

    if (!selectedStaff) {
      selectedStaff = eligibleStaff[0];
    }

    const currentAssignedCount = workloadMap.get(selectedStaff.id) || 0;

    return {
      recommended_department_id: dept.id,
      recommended_department_name: dept.name,
      recommended_staff_id: selectedStaff.id,
      recommended_staff_name: selectedStaff.full_name,
      routing_reason: `Matched department "${dept.name}". Assigned to ${selectedStaff.full_name} (${selectedStaff.role}) based on optimal active workload (${currentAssignedCount} active tickets).`,
      is_auto_assigned: true,
    };
  }
}

export const routingAgent = new SmartRoutingAgent();
