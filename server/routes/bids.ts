import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

interface CreateBidFolderRequest {
  basePath: string;
  bid: {
    id: string;
    year: number;
    state: string;
    city: string;
    bidNumber: string;
    notes: string;
    attachments: Array<{
      name: string;
      url: string;
      type: string;
    }>;
  };
}

export const handleCreateBidFolder: RequestHandler = (req, res) => {
  try {
    const { basePath, bid } = req.body as CreateBidFolderRequest;

    if (!basePath || !bid) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create folder structure: basePath/YEAR/STATE/CITY/BIDNUMBER
    const bidFolderPath = path.join(
      basePath,
      bid.year.toString(),
      bid.state.toUpperCase(),
      bid.city,
      bid.bidNumber
    );

    const docsPath = path.join(bidFolderPath, "Docs");
    const proposalPath = path.join(bidFolderPath, "Proposta");

    // Create directories
    fs.mkdirSync(docsPath, { recursive: true });
    fs.mkdirSync(proposalPath, { recursive: true });

    // Save notes to a text file if provided
    if (bid.notes && bid.notes.trim()) {
      const notesPath = path.join(docsPath, "Diario_do_Processo.txt");
      fs.writeFileSync(
        notesPath,
        `Diário do Processo da Licitação ${bid.bidNumber}\n`,
        "utf-8"
      );
      fs.appendFileSync(notesPath, `Criado em: ${new Date().toLocaleString()}\n\n`, "utf-8");
      fs.appendFileSync(notesPath, bid.notes, "utf-8");
    }

    // Log attachment info (actual file content would need to be handled differently)
    if (bid.attachments && bid.attachments.length > 0) {
      const attachmentsLog = bid.attachments
        .map((att) => `- ${att.name} (${att.type})`)
        .join("\n");
      const attachmentsPath = path.join(docsPath, "Anexos_Info.txt");
      fs.writeFileSync(
        attachmentsPath,
        `Anexos da Licitação ${bid.bidNumber}\n\n${attachmentsLog}`,
        "utf-8"
      );
    }

    res.json({
      success: true,
      bidFolderPath,
      docsPath,
      proposalPath,
      message: "Pasta da licitação criada com sucesso",
    });
  } catch (error) {
    console.error("Error creating bid folder:", error);
    res.status(500).json({
      error: "Failed to create bid folder",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleSetBasePath: RequestHandler = (req, res) => {
  try {
    const { basePath } = req.body;

    if (!basePath) {
      return res.status(400).json({ error: "Base path is required" });
    }

    // Verify the path exists and is a directory
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    const stats = fs.statSync(basePath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: "Base path is not a directory" });
    }

    // Return success (in production, you'd save this to config)
    res.json({
      success: true,
      basePath,
      message: "Base path set successfully",
    });
  } catch (error) {
    console.error("Error setting base path:", error);
    res.status(500).json({
      error: "Failed to set base path",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
