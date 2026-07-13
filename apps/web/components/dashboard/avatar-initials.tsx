import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";

type AvatarInitialsProps = {
  firstName: string;
  lastName: string;
  size?: "sm" | "default" | "lg";
};

/** Shared initials avatar for customer/booking rows -- one place that owns the fallback styling. */
export function AvatarInitials({ firstName, lastName, size = "default" }: AvatarInitialsProps) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";

  return (
    <Avatar size={size}>
      <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
    </Avatar>
  );
}
