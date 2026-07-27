import { groupPermissions, permissionLabel } from "../lib/permission-groups";

interface Props {
  catalog: string[];
  selected: string[];
  onToggle: (permission: string) => void;
}

export function PermissionChecklist({ catalog, selected, onToggle }: Props) {
  const groups = groupPermissions(catalog);

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{group.label}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {group.permissions.map((permission) => (
              <label key={permission} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-brand"
                  checked={selected.includes(permission)}
                  onChange={() => onToggle(permission)}
                />
                {permissionLabel(permission)}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
