import { Bid, AppSettings } from "@/types";

const BIDS_KEY = "bids_data";
const SETTINGS_KEY = "app_settings";

export const bidStorage = {
  getBids: (): Bid[] => {
    try {
      const data = localStorage.getItem(BIDS_KEY);
      if (!data) return [];
      const bids = JSON.parse(data);
      // Convert date strings back to Date objects and migrate old status values
      return bids.map((bid: any) => {
        // Migrate old status values to new ones
        let status = bid.status;
        if (status === "participate") status = "codificado";
        if (status === "analyzing") status = "questionamento";
        if (status === "cadastrado") status = "codificado";

        return {
          ...bid,
          status,
          disputeDate: new Date(bid.disputeDate),
          createdAt: new Date(bid.createdAt),
          updatedAt: new Date(bid.updatedAt),
          attachments: bid.attachments.map((att: any) => ({
            ...att,
            uploadedAt: new Date(att.uploadedAt),
          })),
          processHistory: bid.processHistory.map((entry: any) => ({
            ...entry,
            date: new Date(entry.date),
          })),
        };
      });
    } catch {
      return [];
    }
  },

  saveBid: (bid: Bid) => {
    const bids = bidStorage.getBids();
    const existingIndex = bids.findIndex((b) => b.id === bid.id);

    if (existingIndex !== -1) {
      bids[existingIndex] = bid;
    } else {
      bids.push(bid);
    }

    localStorage.setItem(BIDS_KEY, JSON.stringify(bids));
  },

  deleteBid: (id: string) => {
    const bids = bidStorage.getBids();
    const filtered = bids.filter((b) => b.id !== id);
    localStorage.setItem(BIDS_KEY, JSON.stringify(filtered));
  },

  getBidById: (id: string): Bid | undefined => {
    const bids = bidStorage.getBids();
    return bids.find((b) => b.id === id);
  },
};

export const settingsStorage = {
  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) {
        return {
          rootPath: "",
          autoSaveEnabled: true,
        };
      }
      return JSON.parse(data);
    } catch {
      return {
        rootPath: "",
        autoSaveEnabled: true,
      };
    }
  },

  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
};
