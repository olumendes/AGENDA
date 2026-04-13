import { BidStatus } from "@/types";

export function getBidColor(status: BidStatus) {
  const colors: Record<
    BidStatus,
    { bg: string; text: string; bgLight: string }
  > = {
    cadastrado: {
      bg: "bg-status-cadastrado",
      text: "text-white",
      bgLight: "bg-status-cadastrado-light text-status-cadastrado",
    },
    questionamento: {
      bg: "bg-status-questionamento",
      text: "text-white",
      bgLight: "bg-status-questionamento-light text-status-questionamento",
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
    cadastrado: "Cadastrado",
    questionamento: "Questionamento",
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
