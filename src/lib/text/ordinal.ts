// A placing, not a quantity: "3rd in class" rather than "3". Positions are the
// one number on a report card a parent reads as a rank, so writing it as one
// removes the beat spent working out what the bare digit means.
//
// The 11–13 carve-out is the reason this isn't inline: they take "th" despite
// ending in 1, 2, 3 (11th, not 11st).
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}
