import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bid } from "@/types";
import { bidStorage } from "@/lib/storage";
import { Calendar } from "@/components/Calendar";
import { BidDetail } from "@/components/BidDetail";
import { BidForm } from "@/components/BidForm";
import { Plus, Settings, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

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

export default function BidsCalendar() {
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<string>("");
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = () => {
    const loadedBids = bidStorage.getBids();
    setBids(loadedBids);
  };

  const handleSaveBid = (bid: Bid) => {
    bidStorage.saveBid(bid);
    loadBids();
    setIsCreating(false);
    setSelectedBid(null);
  };

  const handleEditBid = (bid: Bid) => {
    bidStorage.saveBid(bid);
    loadBids();
    setSelectedBid(bid);
  };

  const handleDeleteBid = (id: string) => {
    bidStorage.deleteBid(id);
    loadBids();
    setSelectedBid(null);
  };

  const getFilteredBids = () => {
    return bids.filter((bid) => {
      const matchesSearch =
        searchQuery === "" ||
        `${bid.bidNumber}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.bidType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bid.observation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState = filterState === "all" || filterState === "" || bid.state === filterState;
      const matchesCity =
        filterCity === "all" || filterCity === "" ||
        bid.city.toLowerCase().includes(filterCity.toLowerCase());
      const matchesYear =
        filterYear === "all" || filterYear === "" || bid.year.toString() === filterYear;

      return matchesSearch && matchesState && matchesCity && matchesYear;
    });
  };

  const filteredBids = getFilteredBids();
  const uniqueCities = Array.from(new Set(bids.map((b) => b.city)))
    .filter(Boolean)
    .sort();
  const uniqueYears = Array.from(new Set(bids.map((b) => b.year))).sort(
    (a, b) => b - a
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Licitações</h1>
          <p className="text-sm text-gray-600">Gestão de Licitações Públicas</p>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-gray-200 space-y-2">
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full bg-primary text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Licitação
          </Button>
          <Button
            onClick={() => navigate("/settings")}
            variant="outline"
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar licitações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3 overflow-y-auto flex-1">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Estado (UF)
            </label>
            <Select value={filterState} onValueChange={setFilterState}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Todos os estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                {BRAZILIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Município
            </label>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Todos os municípios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os municípios</SelectItem>
                {uniqueCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Ano
            </label>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {uniqueYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          {filteredBids.length} licitação{filteredBids.length !== 1 ? "s" : ""} encontrada{filteredBids.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isCreating ? (
          <div className="flex-1 overflow-y-auto">
            <div className="border-b border-gray-200 p-4 bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-900">
                  Criar Nova Licitação
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="max-w-6xl mx-auto p-6">
              <BidForm
                onSave={handleSaveBid}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          </div>
        ) : selectedBid ? (
          <div className="flex-1 overflow-y-auto">
            <BidDetail
              bid={selectedBid}
              onEdit={handleEditBid}
              onDelete={handleDeleteBid}
              onClose={() => setSelectedBid(null)}
            />
          </div>
        ) : (
          <Calendar
            bids={filteredBids}
            onSelectBid={setSelectedBid}
            onNewBid={() => setIsCreating(true)}
          />
        )}
      </div>
    </div>
  );
}
