import { redirect } from "next/navigation";

export default function NewWalkInBookingPage() {
  redirect("/app/bookings?newBooking=1");
}
