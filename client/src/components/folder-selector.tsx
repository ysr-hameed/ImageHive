import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder, FolderPlus, X } from "lucide-react";

interface FolderSelectorProps {
  folders: Array<{ name: string; count: number }>;
  selectedFolder: string;
  newFolder: string;
  onFolderChange: (folder: string) => void;
  onNewFolderChange: (folder: string) => void;
}

export default function FolderSelector({
  folders,
  selectedFolder,
  newFolder,
  onFolderChange,
  onNewFolderChange,
}: FolderSelectorProps) {
  const [showNewFolder, setShowNewFolder] = useState(false);

  const handleFolderSelect = (value: string) => {
    if (value === "new-folder") {
      setShowNewFolder(true);
      onFolderChange("");
    } else {
      setShowNewFolder(false);
      onFolderChange(value);
      onNewFolderChange("");
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="folder-select" className="flex items-center gap-2">
        <Folder className="w-4 h-4" />
        Organize in Folder
      </Label>
      
      <div className="space-y-2">
        <Select value={selectedFolder || "none"} onValueChange={handleFolderSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No folder</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.name} value={folder.name}>
                <div className="flex items-center justify-between w-full">
                  <span>{folder.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {folder.count} items
                  </span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="new-folder">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                Create new folder
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        {showNewFolder && (
          <div className="flex gap-2">
            <Input
              placeholder="Enter folder name"
              value={newFolder}
              onChange={(e) => onNewFolderChange(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowNewFolder(false);
                onNewFolderChange("");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {(selectedFolder || newFolder) && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Images will be uploaded to: <strong>{newFolder || selectedFolder}</strong>
          </p>
        )}
      </div>
    </div>
  );
}