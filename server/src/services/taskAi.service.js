import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { taskRepository } from "../repositories/task.repository.js";
import { logger } from "../utils/logger.js";

export async function parseTasksWithAi(paragraph) {
  if (!paragraph || typeof paragraph !== "string" || !paragraph.trim()) {
    throw new Error("Work plan paragraph must be a non-empty string");
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please define it in your .env file.");
  }

  logger.info("Initializing Gemini AI model for task extraction...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const currentDateContext = "Monday, 10 August 2026";

  const systemPrompt = `You are a professional AI task-extraction assistant for Pronix Digital.
Analyze the provided work plan text and convert it into multiple structured individual tasks.
Do NOT treat the input as one single task; divide it into individual actionable tasks.

Today's date is: ${currentDateContext}. Use this reference date to resolve relative dates mentioned in the text (e.g. "today" -> 2026-08-10, "tomorrow" -> 2026-08-11, "next Monday" -> 2026-08-17, etc.).
If a task does NOT contain an absolute or relative date term (like 'today', 'tomorrow', '15 August', etc.), do NOT infer it to be today's date; set 'date' strictly to null.
If the year is not specified, use 2026. The campaign context spans 10 August 2026 to 20 September 2026.

==================================================
OUTPUT FORMAT
==================================================
Return ONLY valid JSON matching this exact structure:
{
  "tasks": [
    {
      "title": "Short, actionable task title",
      "description": "Additional context if available, otherwise empty string",
      "date": "YYYY-MM-DD or null if missing/unclear",
      "startTime": "HH:MM (24-hour format) or null if missing",
      "endTime": "HH:MM (24-hour format) or null if missing",
      "assignedTo": "Parth or Ronit or Both or Unassigned",
      "category": "Pick the best category from ALLOWED CATEGORIES",
      "priority": "Low or Medium or High or Urgent",
      "status": "Pending",
      "notes": "Any other notes, otherwise empty string",
      "confidence": 0.95,
      "dependencyIndex": null, // Integer index (0-indexed) of the task this task depends on (e.g. if this task is performed 'after' another task)
      "isRecurring": false, // boolean
      "recurrence": null // { "frequency": "daily" } if recurring (e.g. daily, weekly)
    }
  ],
  "warnings": [
    "String messages about missing or ambiguous details"
  ]
}

==================================================
TASK EXTRACTION RULES
==================================================
1. Break every independent actionable activity into its own task. Do not combine unrelated activities.
2. Valid assignedTo values: "Parth", "Ronit", "Both", "Unassigned". If no person is mentioned, use "Unassigned". Never invent a different person.
3. If a task mentions "both", assign to "Both".
4. Valid categories: Technical, Non-Technical, Content, Social Media, Marketing, Business Development, Lead Generation, Client Outreach, Design, Development, Testing, Website, AI, Research, Meeting, Administration, Other. Use the most appropriate category.
5. Infer priority: Default to "Medium". Use "High" for launch-related, client-related, deadline-sensitive, or publishing prep tasks. Use "Urgent" only if the text explicitly indicates urgency.
6. Time normalization: Convert any 12-hour or relative times to 24-hour "HH:MM" format (e.g. "8:30 PM" -> "20:30", "from 8:40 to 9:05" -> startTime: "20:40", endTime: "21:05"). If only start time is given, set endTime to null.
7. Dependencies: If text contains sequence indicators like "after that", "then", "once completed", use "dependencyIndex" to point to the index of the prerequisite task in the returned array.
8. Repeating tasks: Identify terms like "every day", "daily" -> set "isRecurring": true, "recurrence": { "frequency": "daily" }.
9. Never invent people, dates, or deadlines. If no date is mentioned in the text, set the date field strictly to null. If uncertain, set to null and add a warning message in the warnings array.`;

  const prompt = `${systemPrompt}\n\nWork Plan Paragraph:\n"${paragraph}"`;

  try {
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const text = response.response.text();
    logger.info(`AI Response text: ${text}`);

    const resultObj = JSON.parse(text);

    if (!resultObj || !Array.isArray(resultObj.tasks)) {
      throw new Error("AI returned invalid JSON: expected an object containing a tasks array");
    }

    const tasks = resultObj.tasks;

    // Process tasks: identify warnings and check duplicates
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const warnings = [];
        if (!task.assignedTo || task.assignedTo === "Unassigned") {
          warnings.push("assignedTo");
          task.assignedTo = "Unassigned"; // Normalise
        }
        if (!task.date) {
          warnings.push("date");
          task.date = null;
        }
        if (!task.startTime) {
          warnings.push("time");
          task.startTime = null;
        }
        if (!task.endTime) {
          task.endTime = null;
        }

        // Check duplicate against existing tasks in DB
        let isDuplicate = false;
        let duplicateTaskId = null;
        if (task.date && task.title) {
          const duplicate = await taskRepository.findOne({
            isDeleted: false,
            date: task.date,
            assignedTo: task.assignedTo,
            startTime: task.startTime,
            title: { $regex: new RegExp(`^${task.title.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") },
          });
          if (duplicate) {
            isDuplicate = true;
            duplicateTaskId = duplicate._id;
          }
        }

        return {
          ...task,
          warnings,
          isDuplicate,
          duplicateTaskId,
        };
      })
    );

    return enrichedTasks;
  } catch (error) {
    logger.error("AI Task Extraction error:", error);
    throw new Error(`Failed to parse tasks using AI: ${error.message}`);
  }
}
