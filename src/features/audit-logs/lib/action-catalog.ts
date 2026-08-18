import { ACTION_CATALOG, type ActionMeta } from "./action-catalog-data";

export { ACTION_CATALOG };
export type { ActionMeta };

// Falls back to a readable sentence for any action the catalog doesn't name —
// "class_arm.created" becomes "created <target>". The catalog was checked
// exhaustively against the backend, so this only fires for actions added there
// since; better a plain sentence than a raw dotted string in the timeline.
export function actionMeta(action: string): ActionMeta {
  return (
    ACTION_CATALOG[action] ?? {
      rest: (target: string) =>
        `${(action.split(".")[1] ?? action).replace(/_/g, " ")} ${target}`.trim(),
    }
  );
}
