import { useState, useEffect } from "react";
import { Bid, BidStatus, BidAttachment, BidType, BidItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBidColor } from "@/lib/bid-utils";
import { settingsStorage } from "@/lib/storage";
import { FileUpload } from "./FileUpload";
import { ItemsManager } from "./ItemsManager";
import { AlertCircle } from "lucide-react";

interface BidFormProps {
  bid?: Bid;
  onSave: (bid: Bid) => void;
  onCancel: () => void;
}

const BRAZILIAN_STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const BID_TYPE_OPTIONS: BidType[] = ["chamamento_publico", "dispensa_eletronica", "pregao_eletronico", "pregao_presencial"];

const BID_TYPE_LABELS: Record<BidType, string> = {
  chamamento_publico: "Chamamento Público",
  dispensa_eletronica: "Dispensa Eletrônica",
  pregao_eletronico: "Pregão Eletrônico",
  pregao_presencial: "Pregão Presencial",
};

const STATUS_OPTIONS: BidStatus[] = ["cadastrado", "codificado", "questionamento", "suspenso", "won", "lost", "nao_temos"];

function calculateStatusFromItems(items: {
  itemsRegistered: BidItem[];
  itemsWon: BidItem[];
  itemsLost: BidItem[];
}): BidStatus {
  // Se tem itens ganhos, status é "won"
  if (items.itemsWon.length > 0) {
    return "won";
  }

  // Se tem itens e todos estão em perdidos, status é "lost"
  const totalItems = items.itemsRegistered.length + items.itemsWon.length + items.itemsLost.length;
  if (totalItems > 0 && items.itemsWon.length === 0 && items.itemsLost.length === totalItems) {
    return "lost";
  }

  // Padrão é cadastrado
  return "cadastrado";
}

export function BidForm({ bid, onSave, onCancel }: BidFormProps) {
  const [formData, setFormData] = useState<Bid>(
    bid || {
      id: crypto.randomUUID(),
      title: "",
      bidType: "pregao_eletronico",
      bidNumber: "",
      observation: "",
      disputeDate: new Date(),
      disputeTime: "09:00",
      portal: "",
      status: "cadastrado",
      year: new Date().getFullYear(),
      state: "",
      city: "",
      notes: "",
      items: {
        itemsRegistered: [],
        itemsWon: [],
        itemsLost: [],
      },
      attachments: [],
      processHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleChange = (
    field: keyof Bid,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
  };


  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Save the bid first
      onSave(formData);

      // Create folder structure if basePath is configured
      const basePath = settingsStorage.getBasePath();
      if (basePath && basePath.trim()) {
        try {
          const response = await fetch("/api/bids/create-folder", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              basePath,
              bid: {
                id: formData.id,
                year: formData.year,
                state: formData.state,
                city: formData.city,
                bidNumber: formData.bidNumber,
                notes: formData.notes,
                attachments: formData.attachments,
              },
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.warn(
              "Failed to create bid folder:",
              errorData.details || errorData.error
            );
          }
        } catch (folderError) {
          console.warn("Could not create folder structure:", folderError);
          // Don't block bid saving if folder creation fails
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar licitação"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Licitação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <Select
                value={formData.bidType}
                onValueChange={(value) =>
                  handleChange("bidType", value as BidType)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BID_TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type} value={type}>
                      {BID_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Número</label>
              <Input
                value={formData.bidNumber}
                onChange={(e) => handleChange("bidNumber", e.target.value)}
                placeholder="ex: 123"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Portal</label>
              <Input
                value={formData.portal}
                onChange={(e) => handleChange("portal", e.target.value)}
                placeholder="ex: ComprasNet, BLL, Licitanet"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Data da Disputa
              </label>
              <Input
                type="date"
                value={formData.disputeDate.toISOString().split("T")[0]}
                onChange={(e) =>
                  handleChange("disputeDate", new Date(e.target.value))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Hora da Disputa
              </label>
              <Input
                type="time"
                value={formData.disputeTime}
                onChange={(e) => handleChange("disputeTime", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status and Location */}
      <Card>
        <CardHeader>
          <CardTitle>Status & Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleChange("status", value as BidStatus)
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cadastrado">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBidColor("cadastrado").bg}`} />
                    Cadastrado
                  </div>
                </SelectItem>
                <SelectItem value="codificado">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBidColor("codificado").bg}`} />
                    Codificado
                  </div>
                </SelectItem>
                <SelectItem value="questionamento">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBidColor("questionamento").bg}`} />
                    Questionamento
                  </div>
                </SelectItem>
                <SelectItem value="suspenso">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBidColor("suspenso").bg}`} />
                    Suspenso
                  </div>
                </SelectItem>
                <SelectItem value="won">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBidColor("won").bg}`} />
                    Ganho
                  </div>
                </SelectItem>
                <SelectItem value="lost">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBidColor("lost").bg}`} />
                    Perdido
                  </div>
                </SelectItem>
                <SelectItem value="nao_temos">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBidColor("nao_temos").bg}`} />
                    Não temos
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Ano</label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => handleChange("year", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Estado (UF)</label>
              <Select value={formData.state} onValueChange={(value) =>
                handleChange("state", value)
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {BRAZILIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Município</label>
              <Input
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Nome do município"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Diário do Processo & Anotações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Documente o processo de licitação aqui: andamento, decisões, problemas, estratégias..."
            className="min-h-24"
          />
        </CardContent>
      </Card>

      {/* Items Management */}
      <ItemsManager
        items={formData.items}
        onItemsChange={(newItems, changeType) => {
          const newStatus = calculateStatusFromItems(newItems);
          setFormData((prev) => ({
            ...prev,
            items: newItems,
            status: newStatus,
            updatedAt: new Date(),
          }));
        }}
      />

      {/* File Attachments */}
      <Card>
        <CardHeader>
          <CardTitle>Anexos</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            attachments={formData.attachments}
            onAdd={(attachment) => {
              setFormData((prev) => ({
                ...prev,
                attachments: [...prev.attachments, attachment],
                updatedAt: new Date(),
              }));
            }}
            onRemove={(id) => {
              setFormData((prev) => ({
                ...prev,
                attachments: prev.attachments.filter((a) => a.id !== id),
                updatedAt: new Date(),
              }));
            }}
          />
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-primary text-white"
          disabled={isLoading}
        >
          {isLoading ? "Salvando..." : "Salvar Licitação"}
        </Button>
      </div>
    </div>
  );
}
