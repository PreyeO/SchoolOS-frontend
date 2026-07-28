import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/text/initials";

interface Props {
  firstName: string;
  lastName: string;
  photo?: string | null;
  className?: string;
}

// Shared across the Staff/Student/Parent directories.
export function PersonAvatar({ firstName, lastName, photo, className }: Props) {
  return (
    <Avatar className={className}>
      {photo && <AvatarImage src={photo} alt="" />}
      <AvatarFallback className="bg-primary/10 text-primary">{initials(firstName, lastName)}</AvatarFallback>
    </Avatar>
  );
}
