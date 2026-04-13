import { Bid } from "@/types";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBidColor, formatBidTitle } from "@/lib/bid-utils";

interface MonthViewProps {
  date: Date;
  bids: Bid[];
  onSelectBid: (bid: Bid) => void;
  onNewBid: () => void;
}

export function MonthView({
  date,
  bids,
  onSelectBid,
  onNewBid,
}: MonthViewProps) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getBidsForDate = (date: Date): Bid[] => {
    return bids.filter(
      (bid) =>
        bid.disputeDate.getDate() === date.getDate() &&
        bid.disputeDate.getMonth() === date.getMonth() &&
        bid.disputeDate.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date | null): boolean => {
    return date ? date.getMonth() === month : false;
  };

  return (
    <div className="w-full h-full p-4">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIdx) =>
          week.map((date, dayIdx) => {
            const daysForDate = date ? getBidsForDate(date) : [];
            const isCurrentDay = date && isCurrentMonth(date);
            const isTodayDate = date && isToday(date);

            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={cn(
                  "min-h-24 border rounded-lg p-1 cursor-pointer hover:bg-gray-50 transition-colors",
                  !isCurrentDay && "bg-gray-50",
                  isTodayDate && "border-primary border-2 bg-blue-50"
                )}
                onClick={onNewBid}
              >
                <div
                  className={cn(
                    "text-xs font-semibold mb-1",
                    isCurrentDay ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {date ? date.getDate() : ""}
                </div>
                <div className="space-y-1">
                  {daysForDate.slice(0, 2).map((bid) => (
                    <div
                      key={bid.id}
                      className={cn(
                        "text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity",
                        getBidColor(bid.status).bg,
                        getBidColor(bid.status).text
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBid(bid);
                      }}
                      title={formatBidTitle(bid.bidType, bid.bidNumber, bid.portal)}
                    >
                      {formatBidTitle(bid.bidType, bid.bidNumber, bid.portal).substring(0, 20)}
                    </div>
                  ))}
                  {daysForDate.length > 2 && (
                    <div className="text-xs text-gray-500 px-1">
                      +{daysForDate.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
