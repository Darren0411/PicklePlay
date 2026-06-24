import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BookingsFilter({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  onRefresh,
}) {
  return (
    <div className="border border-border rounded-md bg-card p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Search Bookings
          </label>
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, or booking ID..."
          />
        </div>
        <div className="md:w-48">
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Filter Status
          </label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Bookings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed Only</SelectItem>
              <SelectItem value="pending">Pending Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}