import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";

type AvatarInitialsProps = {
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  size?: "sm" | "default" | "lg";
};

/** Customer avatar with LINE profile image when available, otherwise initials. */
export function AvatarInitials({
  firstName,
  lastName,
  imageUrl,
  size = "default",
}: AvatarInitialsProps) {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
  const displayName = `${firstName} ${lastName}`.trim();

  return (
    <Avatar size={size}>
      {imageUrl ? <AvatarImage src={imageUrl} alt={displayName} /> : null}
      <AvatarFallback className="bg-[#16A34A]/15 font-semibold text-[#166534] dark:text-emerald-400">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
