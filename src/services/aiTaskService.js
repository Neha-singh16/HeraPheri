import { gemini, GEMINI_MODEL } from "../config/gemini.js";

const taskDraftSchema = {
  type: "object",

  properties: {
    title: {
      type: "string",
    },

    description: {
      type: "string",
    },

    category: {
      type: "string",
      enum: ["GO", "GET", "CHECK", "DIGITAL"],
    },

    taskMode: {
      type: "string",
      enum: ["PHYSICAL", "DIGITAL", "HYBRID"],
    },

    riskLevel: {
      type: "string",
      enum: ["LOW", "MEDIUM"],
    },
    proofType: {
      type: "string",

      enum: [
        "PHOTO",
        "VIDEO",
        "RECEIPT",
        "DOCUMENT",
        "OTP",
        "TEXT_RESULT",
        "FILE",
      ],
    },
    suggestedReward: {
      type: "number",
    },

    needsLocation: {
      type: "boolean",
    },

    clarifyingQuestions: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },

  required: [
    "title",
    "description",
    "category",
    "taskMode",
    "riskLevel",
    "proofType",
    "suggestedReward",
    "needsLocation",
    "clarifyingQuestions",
  ],

  additionalProperties: false,

  propertyOrdering: [
    "title",
    "description",
    "category",
    "taskMode",
    "riskLevel",
    "proofType",
    "suggestedReward",
    "needsLocation",
    "clarifyingQuestions",
  ],
};

export async function generateTaskDraft(userInput) {
  if (typeof userInput !== "string" || userInput.trim().length < 10) {
    throw new Error("Please describe the task in a little more detail.");
  }

  if (userInput.length > 3000) {
    throw new Error("Task description is too long.");
  }

  const prompt = `
You are the HEREPHERI Task Copilot.

HEREPHERI is a delegation marketplace where a
requester describes a legitimate task and an
executor performs it.

Convert the user's natural-language request into
a task draft.

IMPORTANT RULES:

1. Do not invent critical facts.
2. Never invent an exact address.
3. Never invent exact dates/times.
4. If information is missing, add a clarifying question.
5. The suggested reward is only a suggestion.
6. Never make high-risk tasks eligible.
7. Prefer LOW risk unless the request clearly indicates
   a higher-risk situation.
8. PHYSICAL means the task requires an in-person action.
9. DIGITAL means it can be completed remotely.
10. HYBRID means it meaningfully requires both.
11. Choose the most appropriate proof type.
12. Keep the title concise.
13. Keep the description operational and specific.
14. Do not include markdown.
15. Return only the requested JSON structure.

Supported categories:
GO, GET, CHECK, DIGITAL

Supported task modes:
PHYSICAL, DIGITAL, HYBRID

Supported risk levels:
LOW, MEDIUM

Supported proof types:
TEXT_RESULT, PHOTO, DOCUMENT, LOCATION, MULTI

User request:

${userInput.trim()}
`;

  let response;

  try {
    response = await gemini.models.generateContent({
      model: GEMINI_MODEL,

      contents: prompt,

      config: {
        responseMimeType: "application/json",

        responseJsonSchema: taskDraftSchema,

        maxOutputTokens: 800,
      },
    });
  } catch (error) {
    console.error("Gemini API error:", {
      message: error.message,
      model: GEMINI_MODEL,
      status: error.status || error.code || null,
    });

    const status = error.status || error.code;

    if (status === 429) {
      throw new Error(
        "AI is temporarily busy. Please try again in a moment.",
      );
    }

    if (status === 503) {
      throw new Error(
        "AI is temporarily unavailable due to high demand. Please try again shortly.",
      );
    }

    if (status === 401 || status === 403) {
      throw new Error(
        "AI configuration is invalid. Please contact the administrator.",
      );
    }

    throw new Error("Unable to generate the AI task draft right now.");
  }

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  let draft;

  try {
    draft = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid structured data.");
  }

  return validateTaskDraft(draft);
}

function validateTaskDraft(draft) {
  const validCategories = ["GO", "GET", "CHECK", "DIGITAL"];

  const validModes = ["PHYSICAL", "DIGITAL", "HYBRID"];

  const validRiskLevels = ["LOW", "MEDIUM"];

  const validProofTypes = [
    "PHOTO",
    "VIDEO",
    "RECEIPT",
    "DOCUMENT",
    "OTP",
    "TEXT_RESULT",
    "FILE",
  ];

  if (!validCategories.includes(draft.category)) {
    throw new Error("AI generated an invalid category.");
  }

  if (!validModes.includes(draft.taskMode)) {
    throw new Error("AI generated an invalid task mode.");
  }

  if (!validRiskLevels.includes(draft.riskLevel)) {
    throw new Error("AI generated an invalid risk level.");
  }

  if (!validProofTypes.includes(draft.proofType)) {
    throw new Error("AI generated an invalid proof type.");
  }

  if (!draft.title?.trim() || !draft.description?.trim()) {
    throw new Error("AI could not produce a usable task.");
  }

  /*
    We never allow AI to override HEREPHERI's
    high-risk policy, even if the model hallucinates
    a different risk level.
  */
  if (draft.riskLevel === "HIGH") {
    draft.riskLevel = "MEDIUM";
  }

  return {
    title: draft.title.trim(),

    description: draft.description.trim(),

    category: draft.category,

    taskMode: draft.taskMode,

    riskLevel: draft.riskLevel,

    proofType: draft.proofType,

    suggestedReward: Number.isFinite(Number(draft.suggestedReward))
      ? Math.max(0, Number(draft.suggestedReward))
      : null,

    needsLocation: Boolean(draft.needsLocation),

    clarifyingQuestions: Array.isArray(draft.clarifyingQuestions)
      ? draft.clarifyingQuestions.slice(0, 5)
      : [],
  };
}
