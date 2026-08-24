// Fees domain types, mirroring fees/serializers.py.

// One billable line, as FeeItemSerializer returns it. klass/academic_period are
// raw ids; the *_name fields are the flattened context the serializer adds so a
// list row can be read without a second lookup.
//
// Amounts are integer Naira throughout the fees API — never kobo, never a
// decimal string. Format for display, but keep the number itself an integer.
export interface FeeItem {
  id: string;
  klass: string;
  class_name: string;
  academic_period: string;
  academic_period_name: string;
  session_name: string;
  name: string;
  amount: number;
  // False once the item has been deactivated instead of deleted — see
  // deleteFeeItem. A deactivated item stops contributing to every student's
  // balance and can never be reactivated through this API.
  is_active: boolean;
  created_at: string;
}

// FeeItemCreateSerializer. The _id suffixes are required: the read filters use
// the bare FK names (klass, academic_period) but the write body does not.
export interface CreateFeeItemPayload {
  klass_id: string;
  academic_period_id: string;
  name: string;
  amount: number;
}

// FeeItemUpdateSerializer — name and amount are the only editable fields. The
// class and period a fee item belongs to are fixed at creation, and is_active
// is read-only, so a deactivated item cannot be revived here.
export interface UpdateFeeItemPayload {
  name?: string;
  amount?: number;
}
