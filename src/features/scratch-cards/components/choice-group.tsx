"use client";

interface Option<T extends string> {
  value: T;
  label: string;
  hint: string;
}

interface Props<T extends string> {
  legend: string;
  name: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

// Radio cards, for a choice whose options need a line of explanation each.
// Native radios keep keyboard and screen-reader behaviour for free; same look
// as the invite form's TeacherTypeField.
export function ChoiceGroup<T extends string>({ legend, name, options, value, onChange }: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer gap-3 rounded-xl border border-n-200 p-3 transition-colors hover:border-n-300 has-checked:border-primary has-checked:bg-primary/5"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 size-4 shrink-0 accent-primary"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{option.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-n-500">{option.hint}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
