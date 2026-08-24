"use client";

import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/text/format-naira";

import { useDeleteFeeItem, useUpdateFeeItem } from "../hooks/use-fee-item-mutations";
import type { FeeItem } from "../types";
import { FeeItemDialog } from "./fee-item-dialog";

interface Props {
  item: FeeItem;
  context: string;
  canEdit: boolean;
}

export function FeeItemRow({ item, context, canEdit }: Props) {
  const updateItem = useUpdateFeeItem();
  const deleteItem = useDeleteFeeItem();

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-3 py-2.5 text-sm text-ink">
        {item.name}
        {!item.is_active && (
          <span className="ml-2 rounded-full border border-n-300 bg-n-50 px-1.5 py-0.5 text-[10px] font-medium text-n-500">
            Inactive
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right font-mono text-sm tabular-nums text-ink">
        {formatNaira(item.amount)}
      </td>
      <td className="px-3 py-2.5 text-right">
        {/* A deactivated item can't be revived — is_active is read-only on the
            update serializer — and it bills nobody, so editing its amount would
            change nothing. Deleting it again would only re-deactivate it. */}
        {!item.is_active ? (
          <span className="text-xs text-n-400 italic">Kept for past receipts</span>
        ) : canEdit ? (
          <span className="inline-flex items-center gap-1">
            <FeeItemDialog
              trigger={
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${item.name}`}>
                  <Pencil className="size-3.5" />
                </Button>
              }
              title={`Edit ${item.name}`}
              context={context}
              submitLabel="Save"
              initialValues={{ name: item.name, amount: item.amount }}
              isPending={updateItem.isPending}
              onSave={(values) => updateItem.mutateAsync({ id: item.id, payload: values })}
            />
            <ConfirmDeleteDialog
              trigger={
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${item.name}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              }
              title={`Remove ${item.name}?`}
              description={
                "Students in this class stop being billed for it. If any payment or waiver " +
                "already references this fee, it's kept as an inactive line instead of being " +
                "deleted, so past receipts still make sense."
              }
              confirmLabel="Remove"
              isPending={deleteItem.isPending}
              onConfirm={() => deleteItem.mutate({ id: item.id, name: item.name })}
            />
          </span>
        ) : null}
      </td>
    </tr>
  );
}
