import type { ActionMeta } from "../action-catalog-data";
import { withoutStatusTag } from "../action-catalog-data";

// Results — scores, submissions, traits, remarks, report cards.
// Grouped by the backend app that emits the action, which is the seam the
// action strings themselves already follow.
export const RESULTS_ACTIONS: Record<string, ActionMeta> = {
  "score.entered": { category: "scores", rest: (t) => `entered a score: ${t}` },
  "score.updated": { category: "scores", rest: (t) => `changed a score: ${t}` },

  "class_arm_subject_result_submission.submitted": {
    category: "results",
    rest: (t) => `submitted results for ${withoutStatusTag(t)}`,
  },
  "class_arm_subject_result_submission.approved": {
    category: "results",
    rest: (t) => `approved results for ${withoutStatusTag(t)}`,
  },
  "class_arm_subject_result_submission.rejected": {
    category: "results",
    rest: (t) => `sent results back for ${withoutStatusTag(t)}`,
  },
  "class_arm_subject_result_submission.unlocked": {
    category: "results",
    rest: (t) => `reopened results for ${withoutStatusTag(t)}`,
  },
  "class_arm_result.locked": {
    category: "results",
    rest: (t) => `locked the results for ${withoutStatusTag(t)}`,
  },
  "class_arm_result.unlocked": {
    category: "results",
    rest: (t) => `unlocked the results for ${withoutStatusTag(t)}`,
  },

  // Repr is "Remark for STU001 (First Term)" — the leading "Remark for " is
  // dropped so the sentence doesn't say "remark" twice. A no-op if the backend
  // ever changes that prefix.
  "student_result_remark.class_teacher_remark_set": {
    category: "results",
    rest: (t) => `set the form teacher's remark — ${t.replace(/^Remark for /, "")}`,
  },
  "student_result_remark.principal_remark_set": {
    category: "results",
    rest: (t) => `set the principal's remark — ${t.replace(/^Remark for /, "")}`,
  },

  "behavioral_trait.created": { category: "traits", rest: (t) => `added behaviour trait ${t}` },
  "behavioral_trait.updated": { category: "traits", rest: (t) => `updated behaviour trait ${t}` },
  "behavioral_trait.deactivated": {
    category: "traits",
    rest: (t) => `deactivated behaviour trait ${t}`,
  },
  "behavioral_trait.deleted": { category: "traits", rest: (t) => `deleted behaviour trait ${t}` },
  "student_trait_rating.rated": { category: "traits", rest: (t) => `rated ${t}` },
  "student_trait_rating.updated": { category: "traits", rest: (t) => `changed a rating: ${t}` },

  // Explicit repr: "Report card settings (senior_secondary)" — the level is
  // already in the target, so the sentence just supplies the verb. Carries a
  // before/after diff of whichever toggles moved.
  "report_card_settings.updated": {
    category: "results",
    rest: (t) => `changed ${t.toLowerCase()}`,
  },
};
