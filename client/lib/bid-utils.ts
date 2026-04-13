import { BidStatus } from "@/types";

export function getBidColor(status: BidStatus) {
  const colors: Record<
    BidStatus,
    { bg: string; text: string; bgLight: string }
  > = {
    participate: {
      bg: "bg-status-participate",
      text: "text-white",
      bgLight: "bg-status-participate-light text-status-participate",
    },
    analyzing: {
      bg: "bg-status-analyzing",
      text: "text-white",
      bgLight: "bg-status-analyzing-light text-status-analyzing",
    },
    won: {
      bg: "bg-status-won",
      text: "text-white",
      bgLight: "bg-status-won-light text-status-won",
    },
    lost: {
      bg: "bg-status-lost",
      text: "text-white",
      bgLight: "bg-status-lost-light text-status-lost",
    },
  };

  return colors[status];
}

export function getStatusLabel(status: BidStatus): string {
  const labels: Record<BidStatus, string> = {
    participate: "Participar",
    analyzing: "Analisando",
    won: "Ganho",
    lost: "Perdido",
  };
  return labels[status];
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date, time: string): string {
  return `${formatDate(date)} às ${time}`;
}
