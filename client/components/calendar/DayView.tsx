import { Bid } from "@/types";
import { Plus } from "lucide-react";
import { getBidColor } from "@/lib/bid-utils";
import { Button } from "@/components/ui/button";

interface DayViewProps {
  date: Date;
  bids: Bid[];
  onSelectBid: (bid: Bid) => void;
  onNewBid: () => void;
}

export function DayView({
  date,
  bids,
  onSelectBid,
  onNewBid,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getBidsForHour = (hour: number): Bid[] => {
    return bids.filter(
      (bid) =>
        bid.disputeDate.getDate() === date.getDate() &&
        bid.disputeDate.getMonth() === date.getMonth() &&
        bid.disputeDate.getFullYear() === date.getFullYear() &&
        parseInt(bid.disputeTime.split(":")[0]) === hour
    );
  };

  return (
    <div className="w-full h-full">
      {/* Date header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {date.toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <Button onClick={onNewBid} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Licitação
          </Button>
        </div>
      </div>

      {/* Time slots */}
      <div className="divide-y divide-gray-200">
        {hours.map((hour) => {
          const daysForHour = getBidsForHour(hour);
          return (
            <div key={hour} className="flex border-l border-gray-200">
              {/* Hour label */}
              <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-2">
                <div className="text-xs text-gray-500 font-medium">
                  {hour.toString().padStart(2, "0")}:00
                </div>
              </div>

              {/* Hour content */}
              <div className="flex-1 p-3 min-h-16 space-y-1">
                {daysForHour.map((bid) => (
                  <div
                    key={bid.id}
                    className={`p-2 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                      getBidColor(bid.status).bg
                    } ${getBidColor(bid.status).text}`}
                    onClick={() => onSelectBid(bid)}
                  >
                    <div className="font-semibold">{bid.disputeTime}</div>
                    <div className="truncate">{bid.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
