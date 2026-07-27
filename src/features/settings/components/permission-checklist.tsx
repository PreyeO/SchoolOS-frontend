import { groupPermissions, permissionLabel } from "../lib/permission-groups";

interface Props {
  catalog: string[];
  selected: string[];
  onToggle: (permission: string) => void;
  onToggleGroup: (permissions: string[], selectAll: boolean) => void;
}

export function PermissionChecklist({ catalog, selected, onToggle, onToggleGroup }: Props) {
  const groups = groupPermissions(catalog);

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
      {groups.map((group) => {
        const allSelected = group.permissions.every((p) => selected.includes(p));
        return (
          <div key={group.label}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{group.label}</p>
              <button
                type="button"
                onClick={() => onToggleGroup(group.permissions, !allSelected)}
                className="cursor-pointer text-[11px] font-medium text-primary hover:underline"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {group.permissions.map((permission) => (
                <label key={permission} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={selected.includes(permission)}
                    onChange={() => onToggle(permission)}
                  />
                  {permissionLabel(permission)}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
