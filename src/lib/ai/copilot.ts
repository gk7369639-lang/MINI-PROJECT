import { aiProvider } from "./provider";
import { KnowledgeBaseArticle, Ticket } from "@/types";

export interface StudentDraftSuggestion {
  refinedSubject: string;
  refinedDescription: string;
  missingDetails: string[];
  suggestedFaqs: KnowledgeBaseArticle[];
}

export interface StaffCopilotDraft {
  summary: string;
  suggestedReply: string;
  suggestedInternalNote: string;
  recommendedResolutionSteps: string[];
  recommendedKbArticles: string[];
}

export class AICopilotService {
  /**
   * Helps student write clearer query and surfaces matching KB articles before submission.
   */
  public async assistStudentQuery(
    subject: string,
    description: string,
    availableKbs: KnowledgeBaseArticle[]
  ): Promise<StudentDraftSuggestion> {
    const combined = `${subject} ${description}`.toLowerCase();

    // Match top 2 KB articles
    const matchedFaqs = availableKbs.filter((kb) => {
      const titleMatch = kb.title.toLowerCase().split(" ").some((w) => w.length > 3 && combined.includes(w));
      const tagMatch = kb.tags.some((tag) => combined.includes(tag.toLowerCase()));
      return titleMatch || tagMatch;
    }).slice(0, 2);

    const missingDetails: string[] = [];
    if (!description.match(/\b\d{6,}\b/) && !description.toLowerCase().includes("reg") && !description.toLowerCase().includes("roll")) {
      missingDetails.push("Mention your Student Registration or Roll Number if relevant.");
    }
    if (combined.includes("fee") || combined.includes("payment")) {
      if (!combined.includes("transaction") && !combined.includes("utr") && !combined.includes("ref")) {
        missingDetails.push("Include Bank Transaction Reference Number (UTR) for fee verification.");
      }
    }
    if (combined.includes("exam") || combined.includes("hall ticket")) {
      if (!combined.includes("course") && !combined.includes("code") && !combined.includes("subject")) {
        missingDetails.push("Specify exact Course Code (e.g., CS301) and Course Title.");
      }
    }

    if (aiProvider.isAIConfigured()) {
      try {
        const prompt = `Refine this student query to be more concise and formal for university administrators.
Subject: ${subject}
Description: ${description}
Return JSON:
{
  "refinedSubject": "refined subject",
  "refinedDescription": "formal refined description",
  "missingDetails": ["detail 1"]
}`;
        const res = await aiProvider.complete(
          [
            { role: "system", content: "You are an academic support assistant. Output valid JSON only." },
            { role: "user", content: prompt },
          ],
          { responseFormat: "json", temperature: 0.2 }
        );
        if (res.text) {
          const parsed = JSON.parse(res.text);
          return {
            refinedSubject: parsed.refinedSubject || subject,
            refinedDescription: parsed.refinedDescription || description,
            missingDetails: parsed.missingDetails?.length ? parsed.missingDetails : missingDetails,
            suggestedFaqs: matchedFaqs,
          };
        }
      } catch (e) {
        // Fall back gracefully
      }
    }

    return {
      refinedSubject: subject.trim().charAt(0).toUpperCase() + subject.trim().slice(1),
      refinedDescription: description.trim(),
      missingDetails,
      suggestedFaqs: matchedFaqs,
    };
  }

  /**
   * Generates a contextual staff reply draft, conversation summary, and internal note proposal.
   */
  public async generateStaffCopilot(
    ticket: Ticket,
    staffName: string
  ): Promise<StaffCopilotDraft> {
    const threadText = ticket.messages?.map((m) => `${m.sender_name} (${m.sender_role}): ${m.content}`).join("\n") || "No message history yet.";

    if (aiProvider.isAIConfigured()) {
      try {
        const prompt = `You are Staff Copilot for a university support ticket resolution platform.
Ticket Number: ${ticket.ticket_number}
Category: ${ticket.category_name || "General"}
Subject: ${ticket.subject}
Original Description: ${ticket.description}
Status: ${ticket.status}
Conversation History:
${threadText}

Staff Handler: ${staffName}

Draft:
1. Short conversation summary.
2. Professional, empathetic staff reply to student.
3. Private internal note with verification steps.
4. 2-3 actionable resolution steps.

Return JSON:
{
  "summary": "...",
  "suggestedReply": "...",
  "suggestedInternalNote": "...",
  "recommendedResolutionSteps": ["step 1", "step 2"],
  "recommendedKbArticles": ["Article title"]
}`;

        const res = await aiProvider.complete(
          [
            { role: "system", content: "You are an academic staff copilot. Output JSON only." },
            { role: "user", content: prompt },
          ],
          { responseFormat: "json", temperature: 0.2 }
        );
        if (res.text) {
          const parsed = JSON.parse(res.text);
          return {
            summary: parsed.summary || `Summary for ${ticket.ticket_number}`,
            suggestedReply: parsed.suggestedReply || "",
            suggestedInternalNote: parsed.suggestedInternalNote || "",
            recommendedResolutionSteps: parsed.recommendedResolutionSteps || [],
            recommendedKbArticles: parsed.recommendedKbArticles || [],
          };
        }
      } catch (e) {
        // Fall back gracefully
      }
    }

    // Deterministic fallback copilot drafts
    let suggestedReply = `Dear ${ticket.student_name},\n\nThank you for reaching out regarding "${ticket.subject}". We have received your query and our department is currently reviewing the records. We will update you with the finalized status within our standard SLA window.\n\nWarm regards,\n${staffName}\n${ticket.department_name || "Support Cell"}`;

    let suggestedInternalNote = `Verified student records for Reg No: ${ticket.student_reg_no || "N/A"}. Prior to closing, ensure ERP master database reflects the updated status.`;

    const resolutionSteps = [
      "Verify student details against central Academic ERP database.",
      "Check supporting documentation or transaction records.",
      "Update ticket resolution summary and notify student upon completion.",
    ];

    if (ticket.category_code === "ATTENDANCE_EXEMPTION") {
      suggestedReply = `Dear ${ticket.student_name},\n\nWe have received your medical condonation request. Your submitted medical certificates are being cross-verified with the departmental attendance register. A formal approval request has been forwarded to the Academic Head.\n\nWarm regards,\n${staffName}`;
      suggestedInternalNote = "Cross-checked student medical certificate. Forwarded condonation request for Department Head review under Regulation 8.2.";
    } else if (ticket.category_code === "FEE_RECEIPT_ISSUE") {
      suggestedReply = `Dear ${ticket.student_name},\n\nWe are reconciling your fee transaction with the banking gateway settlement report. Kindly allow 24 hours for the payment gateway clearance to reflect on your student ledger.\n\nWarm regards,\n${staffName}`;
    }

    return {
      summary: `Ticket #${ticket.ticket_number} logged by ${ticket.student_name} regarding ${ticket.subject} (Priority: ${ticket.priority}, Status: ${ticket.status}).`,
      suggestedReply,
      suggestedInternalNote,
      recommendedResolutionSteps: resolutionSteps,
      recommendedKbArticles: ["Student Support Policy & SLA Guidelines"],
    };
  }
}

export const copilotService = new AICopilotService();
