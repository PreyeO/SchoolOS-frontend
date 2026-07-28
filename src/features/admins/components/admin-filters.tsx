import { Input } from "@/components/ui/input";
import { useRoles } from "@/features/invitations/hooks/use-roles";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  roleId: string;
  onRoleIdChange: (value: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (value: boolean) => void;
}

export function AdminFilters({
  search,
  onSearchChange,
  roleId,
  onRoleIdChange,
  showInactive,
  onShowInactiveChange,
}: Props) {
  const { data: roles } = useRoles();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        aria-label="Filter by role"
        value={roleId}
        onChange={(e) => onRoleIdChange(e.target.value)}
        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
      >
        <option value="">All roles</option>
        {roles?.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-sm text-n-500">
        <input
          type="checkbox"
          className="accent-primary"
          checked={showInactive}
          onChange={(e) => onShowInactiveChange(e.target.checked)}
        />
        Show inactive
      </label>

      <Input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="ml-auto h-9 max-w-xs"
      />
    </div>
  );
}
