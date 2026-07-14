// Canonical shape of a class as the backend returns it (POST /api/classes/bulk/
// and GET /api/schools/:id/onboarding/review). Lives in lib/ (not
// features/onboarding/) so both the onboarding feature and the school-store
// can reference the same real record — including ids — without either
// depending on the other.
export interface ClassArmRecord {
  id: string;
  name: string;
}

export interface ClassRecord {
  id: string;
  name: string;
  level: string;
  order: number;
  arms: ClassArmRecord[];
}
