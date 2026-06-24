import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(dateString) {
  if (!dateString || dateString === "N/A") return "N/A";
  try {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function TableSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export default function BookingsTable({
  bookings,
  filteredBookings,
  loading,
  editingBookingId,
  setEditingBookingId,
  updatingStatus,
  deletingBookingId,
  onUpdateStatus,
  onDelete,
}) {
  if (loading) return <TableSkeleton />;

  if (filteredBookings.length === 0) {
    return (
      <div className="border border-border rounded-md p-12 text-center">
        <p className="text-sm font-medium text-foreground mb-1">No bookings found</p>
        <p className="text-xs text-muted-foreground">
          Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Booking Details</h2>
        <span className="text-xs text-muted-foreground">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-border bg-card">
              {["Booking ID", "Customer", "Contact", "Date & Time", "Amount", "Payment Method", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-secondary/5 transition-colors">
                <td className="px-4 py-4">
                  <span className="text-xs font-mono text-muted-foreground">
                    #{booking.id.slice(0, 8)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 border border-border flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {booking.customerName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">
                        {booking.customerName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {booking.customerEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs text-muted-foreground">
                    {booking.customerPhone}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs font-medium text-foreground mb-1">
                    {formatDate(booking.date)}
                  </div>
                  <div className="space-y-1">
                    {booking.slots?.map((slot, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground border border-border rounded-sm px-2 py-0.5 inline-block">
                        {slot.timeDisplay}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-semibold text-foreground">
                    ₹{booking.totalAmount}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="outline" className="text-xs">
                    {booking.paymentMethod === "online" ? "Online" : "Venue"}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  {editingBookingId === booking.id ? (
                    <select
                      value={booking.paymentStatus}
                      onChange={(e) => {
                        if (window.confirm(`Change status to "${e.target.value}"?`)) {
                          onUpdateStatus(booking.id, e.target.value);
                        }
                      }}
                      disabled={updatingStatus}
                      className="text-xs border border-border rounded-sm px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
                  ) : (
                    <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"} className="text-xs">
                      {booking.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingBookingId(
                        editingBookingId === booking.id ? null : booking.id
                      )}
                      disabled={updatingStatus || deletingBookingId === booking.id}
                      className="text-xs h-7 px-2"
                    >
                      {editingBookingId === booking.id ? "Cancel" : "Edit"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(booking.id)}
                      disabled={deletingBookingId === booking.id || updatingStatus}
                      className="text-xs h-7 px-2"
                    >
                      {deletingBookingId === booking.id ? "..." : "Delete"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}