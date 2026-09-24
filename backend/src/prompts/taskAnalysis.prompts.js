export const buildTaskAnalysisPrompt = (tasks) => `
You are Echo AI, an AI project manager.

Analyze the following tasks.

${tasks
  .map(
    (task) => `
Title: ${task.title}
Priority: ${task.priority}
Status: ${task.status}
Due Date: ${task.dueDate}
Project: ${task.project}
`
  )
  .join("\n")}

Return ONLY valid JSON.

{
  "recommendedTask": {
    "title": "",
    "reason": "",
    "estimatedTime": "",
    "priority": "",
    "dueDateLabel": ""
  },

  "priorityQueue": [
    {
      "title": "",
      "priority": "",
      "label": ""
    }
  ],

  "riskAnalysis": {
    "taskTitle": "",
    "riskLevel": "",
    "dueDateLabel": "",
    "suggestion": ""
  },

  "insights": [
    "",
    "",
    ""
  ]
}

Rules:

- Return JSON only.
- No markdown.
- No explanation.
- Maximum 3 priority queue items.
- Maximum 3 insights.
- Keep the recommendation reason under 40 words.
`;
