import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settingsStorage } from "@/lib/storage";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [rootPath, setRootPath] = useState("");
  const [autoSave, setAutoSave] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const settings = settingsStorage.getSettings();
    setRootPath(settings.rootPath);
    setAutoSave(settings.autoSaveEnabled);
  }, []);

  const handleSave = () => {
    settingsStorage.saveSettings({
      rootPath,
      autoSaveEnabled: autoSave,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Root Path Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Local Storage Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Configure the root directory where bid-related documents will be saved on your computer.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Root Path for Documents
              </label>
              <Input
                type="text"
                value={rootPath}
                onChange={(e) => setRootPath(e.target.value)}
                placeholder="e.g., Z:\1 -DIMAVE E\01 - EDITAIS E PROPOSTAS"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                This path will be used as the base directory for organizing bid documents by state, city, and year.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Save Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Auto-Save Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                Enable auto-save for bid changes
              </span>
            </label>
            <p className="text-xs text-gray-500">
              When enabled, changes to bids are automatically saved to local storage.
            </p>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              All bid data is stored locally in your browser's storage. No data is sent to external servers.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                const bidsStr = localStorage.getItem("bids_data") || "{}";
                const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(bidsStr)}`;
                const link = document.createElement("a");
                link.setAttribute("href", dataStr);
                link.setAttribute("download", `bids-backup-${Date.now()}.json`);
                link.click();
              }}
            >
              Export Bids as JSON
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          <div>
            {saved && (
              <div className="text-sm text-green-600 flex items-center gap-2">
                <Save className="h-4 w-4" />
                Settings saved successfully
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            size="lg"
            className="bg-primary text-white"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
