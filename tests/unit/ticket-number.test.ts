import { describe, it, expect } from "vitest";
import { generateTicketNumber } from "@/lib/utils";

describe("Ticket ID Generation Unit Tests", () => {
  it("should generate ticket numbers matching SQRP-YEAR-XXXXXX format", () => {
    const ticketNo = generateTicketNumber();
    const currentYear = new Date().getFullYear();
    const regex = new RegExp(`^SQRP-${currentYear}-[A-Z0-9]{6}$`);
    expect(regex.test(ticketNo)).toBe(true);
  });

  it("should generate 100 unique ticket numbers without collisions", () => {
    const set = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const id = generateTicketNumber();
      expect(set.has(id)).toBe(false);
      set.add(id);
    }
    expect(set.size).toBe(100);
  });
});
