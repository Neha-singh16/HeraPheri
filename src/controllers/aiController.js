import {
  generateTaskDraft,
} from "../services/aiTaskService.js";


export async function generateTaskDraftController(
  req,
  res,
) {
  try {
    const draft =
      await generateTaskDraft(
        req.body.prompt,
      );

    return res.status(200).json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error(
      "AI task draft error:",
      {
        message: error.message,
        userId: req.user?.id,
      },
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to generate task draft.",
    });
  }
}