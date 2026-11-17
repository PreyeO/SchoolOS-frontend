"use client";

import { ArmPicker } from "@/components/shared/arm-picker";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { buildArmOptions } from "@/lib/school/arm-options";
import type { ClassRecord } from "@/lib/school/class-record";

import type { IssuanceChannel } from "../../types";
import { ChoiceGroup } from "../choice-group";
import { StudentMultiPick, type PickedStudent } from "./student-multi-pick";

export type ScopeKind = "school" | "class" | "arm" | "selection";

export interface IssueFormState {
  sessionId: string;
  channel: IssuanceChannel;
  scope: ScopeKind;
  classId: string;
  armId: string;
  students: PickedStudent[];
}

const CHANNELS: { value: IssuanceChannel; label: string; hint: string }[] = [
  { value: "sms", label: "Text each parent", hint: "The serial and PIN go straight to the parent's phone. Uses SMS credits." },
  { value: "print", label: "Print named slips", hint: "Slips with each student's name, for you to print and hand out. Free." },
];

const SCOPES: { value: ScopeKind; label: string }[] = [
  { value: "class", label: "One class" },
  { value: "arm", label: "One arm" },
  { value: "selection", label: "Chosen students" },
  { value: "school", label: "The whole school" },
];

interface Props {
  value: IssueFormState;
  onChange: (next: IssueFormState) => void;
  sessions: { id: string; name: string }[];
  classes: ClassRecord[];
}

export function IssueForm({ value, onChange, sessions, classes }: Props) {
  const set = (patch: Partial<IssueFormState>) => onChange({ ...value, ...patch });
  const sorted = [...classes].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="issue-session">Session</Label>
          <Select id="issue-session" value={value.sessionId} onChange={(e) => set({ sessionId: e.target.value })}>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="issue-scope">Who gets a card</Label>
          <Select id="issue-scope" value={value.scope} onChange={(e) => set({ scope: e.target.value as ScopeKind })}>
            {SCOPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
      </div>

      {value.scope === "class" && (
        <div className="space-y-1.5">
          <Label htmlFor="issue-class">Class</Label>
          <Select id="issue-class" value={value.classId} onChange={(e) => set({ classId: e.target.value })}>
            <option value="">Choose a class</option>
            {sorted.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
      )}
      {value.scope === "arm" && (
        <div className="space-y-1.5">
          <Label htmlFor="issue-arm">Arm</Label>
          <ArmPicker id="issue-arm" groups={buildArmOptions(classes)} value={value.armId || null} placeholder="Choose an arm" onChange={(armId) => set({ armId })} />
        </div>
      )}
      {value.scope === "selection" && <StudentMultiPick value={value.students} onChange={(students) => set({ students })} />}

      <ChoiceGroup legend="How to give out the cards" name="issue-channel" options={CHANNELS} value={value.channel} onChange={(channel) => set({ channel })} />
    </div>
  );
}
