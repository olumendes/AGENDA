import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import os from "os";

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

// Map attachment types to folder names
const ATTACHMENT_FOLDERS: Record<string, string> = {
  "proposta-inicial": "Proposta Inicial",
  "proposta-final": "Proposta Final",
  "empenhos": "Empenhos",
  "atas": "Atas",
  "edital": "Edital",
  "termo": "Termo de Referência",
  "resultado": "Resultado",
  "outro": "Outros",
};

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
    const anexosPath = path.join(bidFolderPath, "Anexos");

    // Create directories
    fs.mkdirSync(docsPath, { recursive: true });
    fs.mkdirSync(anexosPath, { recursive: true });

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

    // Save attachment files
    const savedAttachments: Array<{ name: string; type: string; path: string }> = [];
    if (bid.attachments && bid.attachments.length > 0) {
      for (const att of bid.attachments) {
        try {
          // Get folder name for this attachment type
          const folderName = ATTACHMENT_FOLDERS[att.type] || ATTACHMENT_FOLDERS["outro"];
          const typePath = path.join(anexosPath, folderName);
          fs.mkdirSync(typePath, { recursive: true });

          // Decode base64 and save file
          if (att.url.startsWith("data:")) {
            const base64Data = att.url.split(",")[1];
            if (base64Data) {
              const filePath = path.join(typePath, att.name);
              fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
              savedAttachments.push({ name: att.name, type: att.type, path: filePath });
            }
          }
        } catch (attError) {
          console.error(`Error saving attachment ${att.name}:`, attError);
          // Continue with other attachments
        }
      }
    }

    res.json({
      success: true,
      bidFolderPath,
      docsPath,
      anexosPath,
      attachmentsSaved: savedAttachments.length,
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

export const handleOpenFile: RequestHandler = (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    // Verify the file/folder exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File or folder not found" });
    }

    // Open the file in file explorer/finder (selecting the file itself)
    const platform = os.platform();
    let command: string;

    if (platform === "win32") {
      // Windows: use explorer with /select to highlight the file
      command = `explorer /select, "${filePath}"`;
    } else if (platform === "darwin") {
      // macOS: use open -R to reveal in Finder
      command = `open -R "${filePath}"`;
    } else {
      // Linux: use nautilus or thunar to show file
      command = `nautilus "${filePath}" 2>/dev/null || xdg-open "$(dirname "${filePath}")"`;
    }

    try {
      execSync(command, { stdio: "ignore", shell: "/bin/bash" });
      res.json({
        success: true,
        message: "File opened in explorer successfully",
      });
    } catch (execError) {
      console.error("Error executing open command:", execError);
      res.status(500).json({
        error: "Failed to open file in explorer",
        details: execError instanceof Error ? execError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error opening file:", error);
    res.status(500).json({
      error: "Failed to open file",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
