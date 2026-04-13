export type BidStatus = "cadastrado" | "questionamento" | "won" | "lost";

export interface Bid {
  id: string;
  title: string; // TIPO + NÚMERO - PRODUTOS (PORTAL)
  observation: string; // Nome do órgão + complementos + número do processo
  disputeDate: Date;
  disputeTime: string; // HH:mm format
  portal: string;
  status: BidStatus;
  year: number;
  state: string;
  city: string;
  notes: string; // Detailed journal/notes
  items: {
    itemsRegistered: string[];
    itemsWon: string[];
    itemsLost: string[];
  };
  attachments: BidAttachment[];
  processHistory: ProcessHistoryEntry[];
  effectiveDate?: string; // Additional date field
  createdAt: Date;
  updatedAt: Date;
}

export interface BidAttachment {
  id: string;
  name: string;
  type: "edital" | "termo" | "atas" | "proposta-inicial" | "proposta-final" | "outro";
  url: string;
  uploadedAt: Date;
}

export interface ProcessHistoryEntry {
  date: Date;
  title: string;
  description: string;
}

export interface AppSettings {
  rootPath: string;
  autoSaveEnabled: boolean;
}
