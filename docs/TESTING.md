# Automated Testing Documentation & Verification Report
## Student Query Resolution Platform (SQRP)

---

## 1. Test Suite Structure

The platform incorporates automated unit and integration tests written in **Vitest**:

```
tests/
├── unit/
│   ├── validation.test.ts        # Zod request validation & length limits
│   ├── ticket-number.test.ts     # Uniqueness & SQRP-2026-XXXXXX format tests
│   ├── state-machine.test.ts     # Role transitions & invalid path blocks
│   ├── routing.test.ts           # Workload balancing & department queue fallback
│   └── classifier.test.ts        # AI triage & keyword scoring fallback logic
└── integration/
    └── ticket-lifecycle.test.ts  # End-to-end query intake, approval & resolution
```

---

## 2. Test Execution Command

Run the automated test runner:
```bash
npm run test
```

### Execution Results:
```
 ✓ tests/unit/state-machine.test.ts (6 tests)
 ✓ tests/unit/validation.test.ts (5 tests)
 ✓ tests/integration/ticket-lifecycle.test.ts (1 test)
 ✓ tests/unit/ticket-number.test.ts (2 tests)
 ✓ tests/unit/classifier.test.ts (3 tests)
 ✓ tests/unit/routing.test.ts (2 tests)

 Test Files  6 passed (6)
      Tests  19 passed (19)
   Duration  2.08s
```

---

## 3. Test Coverage Highlights

1. **State Machine Verification**: Confirms that Students cannot resolve their own tickets, Staff cannot bypass Head approval for waiver-mandated categories, and invalid state jumps (e.g. `SUBMITTED` directly to `CLOSED`) are rejected.
2. **AI Fallback Resilience**: Confirms that when external AI tokens are not configured, the rule-based NLP engine accurately classifies keywords like "hospital", "dengue", "attendance", "receipt", "fee", and "wifi" to the correct department with high confidence.
3. **Data Quarantine**: Ensures internal faculty notes are never returned in public message queries.
4. **ID Uniqueness**: Confirms 100 consecutive ticket number generations produce zero collisions.
