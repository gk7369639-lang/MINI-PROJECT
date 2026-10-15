import { z } from "zod";
import { aiProvider } from "./provider";
import { AIClassificationResult, SupportCategory, Department, TicketPriority } from "@/types";

export const ClassificationSchema = z.object({
  suggested_category_id: z.string(),
  suggested_category_name: z.string(),
  suggested_department_id: z.string(),
  suggested_department_name: z.string(),
  suggested_priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  confidence_score: z.number().min(0).max(1),
  summary: z.string().min(5),
  extracted_entities: z.object({
    urgency_reason: z.string().optional(),
    identified_keywords: z.array(z.string()).default([]),
    missing_details: z.array(z.string()).default([]),
  }),
  recommended_next_action: z.string(),
});

export class QueryClassifierAgent {
  public async classifyTicket(
    subject: string,
    description: string,
    categories: SupportCategory[],
    departments: Department[]
  ): Promise<AIClassificationResult> {
    const combinedText = `${subject} ${description}`.toLowerCase();

    // Check if remote LLM is available
    if (aiProvider.isAIConfigured()) {
      try {
        const catCatalog = categories
          .map((c) => `- Category ID: "${c.id}", Name: "${c.name}", Code: "${c.code}", Dept ID: "${c.department_id}"`)
          .join("\n");

        const deptCatalog = departments
          .map((d) => `- Dept ID: "${d.id}", Code: "${d.code}", Name: "${d.name}"`)
          .join("\n");

        const prompt = `You are the University Support Triage AI. Analyze the following student query and classify it precisely.
Return ONLY valid JSON matching this exact structure:
{
  "suggested_category_id": "<one valid Category ID from the catalog>",
  "suggested_category_name": "<matching name>",
  "suggested_department_id": "<matching Dept ID>",
  "suggested_department_name": "<matching dept name>",
  "suggested_priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "confidence_score": 0.85,
  "summary": "<1-2 sentence executive summary of problem>",
  "extracted_entities": {
    "urgency_reason": "<if high/urgent, why>",
    "identified_keywords": ["keyword1", "keyword2"],
    "missing_details": ["detail if any missing"]
  },
  "recommended_next_action": "<e.g., Verify bank transaction ref or Request medical proof>"
}

Catalog of Allowed Categories:
${catCatalog}

Catalog of Departments:
${deptCatalog}

Student Query Subject: ${subject}
Student Query Description: ${description}
`;

        const response = await aiProvider.complete(
          [
            { role: "system", content: "You are an automated academic support query classification engine. Output JSON only." },
            { role: "user", content: prompt },
          ],
          { responseFormat: "json", temperature: 0.1 }
        );

        if (response.text) {
          const parsed = JSON.parse(response.text);
          const validated = ClassificationSchema.parse(parsed);
          return validated;
        }
      } catch (err) {
        console.warn("[QueryClassifierAgent] LLM parsing failed, using rule-based classifier:", err);
      }
    }

    // Deterministic Rule-Based Fallback Classifier
    return this.ruleBasedClassifier(combinedText, categories, departments, subject, description);
  }

  private ruleBasedClassifier(
    text: string,
    categories: SupportCategory[],
    departments: Department[],
    subject: string,
    description: string
  ): AIClassificationResult {
    // Keyword scoring matrices
    const rules: Array<{
      categoryCode: string;
      deptCode: string;
      keywords: string[];
      defaultPriority: TicketPriority;
      recommendedAction: string;
    }> = [
      {
        categoryCode: "ATTENDANCE_EXEMPTION",
        deptCode: "ACAD",
        keywords: ["attendance", "condonation", "shortage", "hospital", "dengue", "medical", "od", "on-duty", "sick"],
        defaultPriority: "HIGH",
        recommendedAction: "Request official medical records and verify against attendance logs",
      },
      {
        categoryCode: "CERTIFICATE_BONAFIDE",
        deptCode: "ACAD",
        keywords: ["bonafide", "transcript", "certificate", "passport", "visa", "grade card", "lor"],
        defaultPriority: "MEDIUM",
        recommendedAction: "Verify fee clearance and generate authenticated digital certificate",
      },
      {
        categoryCode: "HALL_TICKET_ERROR",
        deptCode: "EXAM",
        keywords: ["hall ticket", "admit card", "exam timetable", "subject code", "exam clash", "seat number"],
        defaultPriority: "HIGH",
        recommendedAction: "Verify course registration in ERP and issue corrected admit slip",
      },
      {
        categoryCode: "EXAM_REVALUATION",
        deptCode: "EXAM",
        keywords: ["revaluation", "paper viewing", "photocopy", "grade", "marks", "re-evaluation", "answer sheet"],
        defaultPriority: "MEDIUM",
        recommendedAction: "Retrieve digitized answer script and assign evaluator reviewer",
      },
      {
        categoryCode: "FEE_RECEIPT_ISSUE",
        deptCode: "FIN",
        keywords: ["fee", "tuition", "payment", "debited", "receipt", "hdfc", "bank", "utr", "transaction", "double deduction"],
        defaultPriority: "HIGH",
        recommendedAction: "Cross-check merchant gateway settlement log for transaction ref",
      },
      {
        categoryCode: "FEE_CONCESSION",
        deptCode: "FIN",
        keywords: ["installment", "concession", "scholarship", "financial hardship", "split fee", "delay payment"],
        defaultPriority: "MEDIUM",
        recommendedAction: "Review student financial declaration and forward for Head approval",
      },
      {
        categoryCode: "IT_PORTAL_ACCESS",
        deptCode: "ITS",
        keywords: ["wifi", "mac address", "portal", "login", "password", "ldap", "eduroam", "network", "internet", "moodle"],
        defaultPriority: "MEDIUM",
        recommendedAction: "Check RADIUS log and verify MAC address binding in DHCP",
      },
      {
        categoryCode: "HOSTEL_MAINTENANCE",
        deptCode: "HOSTEL",
        keywords: ["hostel", "room", "mess", "food", "geyser", "fan", "plumbing", "water", "carpenter", "warden"],
        defaultPriority: "LOW",
        recommendedAction: "Dispatch maintenance technician to dormitory room",
      },
    ];

    let bestScore = 0;
    let matchedRule = rules[0];
    const matchedKeywords: string[] = [];

    for (const rule of rules) {
      let score = 0;
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          score += 2;
          if (!matchedKeywords.includes(kw)) {
            matchedKeywords.push(kw);
          }
        }
      }
      if (score > bestScore) {
        bestScore = score;
        matchedRule = rule;
      }
    }

    const matchedCategory = categories.find((c) => c.code === matchedRule.categoryCode) || categories[0];
    const matchedDept = departments.find((d) => d.id === matchedCategory.department_id) || departments[0];

    // Priority escalation check
    let priority: TicketPriority = matchedRule.defaultPriority;
    const urgencyReason = text.includes("urgent") || text.includes("exam tomorrow") || text.includes("immediate")
      ? "Time-sensitive academic deadline detected in student query"
      : undefined;

    if (urgencyReason) {
      priority = "URGENT";
    }

    const confidence = bestScore > 0 ? Math.min(0.65 + bestScore * 0.05, 0.95) : 0.55;

    return {
      suggested_category_id: matchedCategory.id,
      suggested_category_name: matchedCategory.name,
      suggested_department_id: matchedDept.id,
      suggested_department_name: matchedDept.name,
      suggested_priority: priority,
      confidence_score: Number(confidence.toFixed(2)),
      summary: `${subject}: Student reporting ${matchedCategory.name.toLowerCase()} concern.`,
      extracted_entities: {
        urgency_reason: urgencyReason,
        identified_keywords: matchedKeywords,
        missing_details: text.length < 40 ? ["Provide additional context or reference numbers"] : [],
      },
      recommended_next_action: matchedRule.recommendedAction,
    };
  }
}

export const classifierAgent = new QueryClassifierAgent();
