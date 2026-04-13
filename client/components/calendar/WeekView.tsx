import { Bid } from "@/types";
import { getBidColor, formatBidTitle } from "@/lib/bid-utils";

interface WeekViewProps {
  date: Date;
  bids: Bid[];
  onSelectBid: (bid: Bid) => void;
  onNewBid: () => void;
}

export function WeekView({
  date,
  bids,
  onSelectBid,
  onNewBid,
}: WeekViewProps) {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day;
  weekStart.setDate(diff);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getBidsForDayHour = (dayDate: Date, hour: number): Bid[] => {
    return bids.filter(
      (bid) =>
        bid.disputeDate.getDate() === dayDate.getDate() &&
        bid.disputeDate.getMonth() === dayDate.getMonth() &&
        bid.disputeDate.getFullYear() === dayDate.getFullYear() &&
        parseInt(bid.disputeTime.split(":")[0]) === hour
    );
  };

  const isToday = (dayDate: Date): boolean => {
    const today = new Date();
    return (
      dayDate.getDate() === today.getDate() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="w-full h-full overflow-auto">
      {/* Day headers */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex">
          <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200" />
          {days.map((dayDate) => {
            const dayNames: Record<string, string> = {
              "Sun": "Dom",
              "Mon": "Seg",
              "Tue": "Ter",
              "Wed": "Qua",
              "Thu": "Qui",
              "Fri": "Sex",
              "Sat": "Sab"
            };
            const dayStr = dayDate.toLocaleDateString("pt-BR", {
              weekday: "short",
            });
            return (
            <div
              key={dayDate.toISOString()}
              className="flex-1 border-r border-gray-200 p-3 text-center"
            >
              <div className="text-sm font-semibold text-gray-900">
                {dayStr}
              </div>
              <div
                className={`text-lg font-bold ${
                  isToday(dayDate) ? "text-primary" : "text-gray-500"
                }`}
              >
                {dayDate.getDate()}
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Time slots */}
      <div className="divide-y divide-gray-200">
        {hours.map((hour) => (
          <div key={hour} className="flex divide-x divide-gray-200">
            {/* Hour label */}
            <div className="w-20 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-2">
              <div className="text-xs text-gray-500 font-medium">
                {hour.toString().padStart(2, "0")}:00
              </div>
            </div>

            {/* Day columns */}
            {days.map((dayDate) => {
              const dayBids = getBidsForDayHour(dayDate, hour);
              return (
                <div
                  key={dayDate.toISOString()}
                  className="flex-1 p-1 min-h-20 bg-white"
                >
                  <div className="space-y-1">
                    {dayBids.slice(0, 2).map((bid) => (
                      <div
                        key={bid.id}
                        className={`p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity ${
                          getBidColor(bid.status).bg
                        } ${getBidColor(bid.status).text}`}
                        onClick={() => onSelectBid(bid)}
                        title={formatBidTitle(bid.bidType, bid.bidNumber, bid.portal)}
                      >
                        <div className="font-semibold truncate">
                          {bid.disputeTime}
                        </div>
                        <div className="truncate text-xs">
                          {formatBidTitle(bid.bidType, bid.bidNumber, bid.portal).substring(0, 15)}
                        </div>
                      </div>
                    ))}
                    {dayBids.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayBids.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
