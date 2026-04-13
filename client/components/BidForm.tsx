import { useState, useEffect } from "react";
import { Bid, BidStatus, BidAttachment } from "@/types";
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
import { Plus, Trash2 } from "lucide-react";
import { getBidColor } from "@/lib/bid-utils";
import { FileUpload } from "./FileUpload";

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

const STATUS_OPTIONS: BidStatus[] = ["codificado", "questionamento", "won", "lost", "nao_temos"];

export function BidForm({ bid, onSave, onCancel }: BidFormProps) {
  const [formData, setFormData] = useState<Bid>(
    bid || {
      id: Date.now().toString(),
      title: "",
      observation: "",
      disputeDate: new Date(),
      disputeTime: "09:00",
      portal: "",
      status: "codificado",
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

  const [newItem, setNewItem] = useState("");

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

  const handleAddItem = (category: "itemsRegistered" | "itemsWon" | "itemsLost") => {
    if (newItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        items: {
          ...prev.items,
          [category]: [...prev.items[category], newItem],
        },
        updatedAt: new Date(),
      }));
      setNewItem("");
    }
  };

  const handleRemoveItem = (
    category: "itemsRegistered" | "itemsWon" | "itemsLost",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      items: {
        ...prev.items,
        [category]: prev.items[category].filter((_, i) => i !== index),
      },
      updatedAt: new Date(),
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Licitação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Título (TIPO + NÚMERO - PRODUTOS (PORTAL))
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="ex: PREGÃO Nº 123 - PRODUTOS (ComprasNet)"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Observação (Órgão + Número do Processo)
            </label>
            <Input
              value={formData.observation}
              onChange={(e) => handleChange("observation", e.target.value)}
              placeholder="ex: Ministério da Saúde - Processo 001.2024"
              className="mt-1"
            />
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

          <div>
            <label className="text-sm font-medium text-gray-700">Portal</label>
            <Input
              value={formData.portal}
              onChange={(e) => handleChange("portal", e.target.value)}
              placeholder="ex: ComprasNet, BLL, Licitanet"
              className="mt-1"
            />
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
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Itens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Registered Items */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Itens Cadastrados
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Descrição do item"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddItem("itemsRegistered");
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => handleAddItem("itemsRegistered")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.items.itemsRegistered.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded"
                >
                  <span className="text-sm">{item}</span>
                  <button
                    onClick={() => handleRemoveItem("itemsRegistered", idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Won Items */}
          <div>
            <label className="text-sm font-medium text-status-won block mb-2">
              O Que Ganhamos
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Item ganho"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddItem("itemsWon");
                  }
                }}
              />
              <Button size="sm" onClick={() => handleAddItem("itemsWon")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.items.itemsWon.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-status-won-light p-2 rounded"
                >
                  <span className="text-sm">{item}</span>
                  <button
                    onClick={() => handleRemoveItem("itemsWon", idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lost Items */}
          <div>
            <label className="text-sm font-medium text-status-lost block mb-2">
              O Que Perdemos
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Item perdido"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddItem("itemsLost");
                  }
                }}
              />
              <Button size="sm" onClick={() => handleAddItem("itemsLost")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.items.itemsLost.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-status-lost-light p-2 rounded"
                >
                  <span className="text-sm">{item}</span>
                  <button
                    onClick={() => handleRemoveItem("itemsLost", idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Form Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="bg-primary text-white">
          Salvar Licitação
        </Button>
      </div>
    </div>
  );
}
