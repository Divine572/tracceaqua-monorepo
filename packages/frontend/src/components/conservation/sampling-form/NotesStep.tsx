"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Upload,
  X,
  File,
  Image,
  Camera,
  Plus,
  AlertCircle,
} from "lucide-react";

export function NotesStep() {
  const { control, watch, setValue } = useFormContext();
  const [customFileHash, setCustomFileHash] = useState("");
  const fileHashes = watch("fileHashes") || [];

  const addFileHash = () => {
    if (customFileHash.trim() && !fileHashes.includes(customFileHash.trim())) {
      setValue("fileHashes", [...fileHashes, customFileHash.trim()]);
      setCustomFileHash("");
    }
  };

  const removeFileHash = (hashToRemove: string) => {
    setValue(
      "fileHashes",
      fileHashes.filter((hash: string) => hash !== hashToRemove)
    );
  };

  const generateSampleHash = () => {
    const sampleHash = `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCustomFileHash(sampleHash);
  };

  return (
    <div className="space-y-6">
      {/* Researcher Notes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Researcher Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="researcherNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Record any additional observations, unusual findings, methodological notes, or other relevant information..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Document any observations, anomalies, or additional context
                  that may be relevant for data analysis or future reference.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* File Attachments Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Attachments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormDescription>
            Add file hashes for photos, videos, additional data files, or other
            supporting documentation. In a production system, these would be
            generated automatically when files are uploaded.
          </FormDescription>

          {/* File Hash Input */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <File className="h-4 w-4" />
              Add File Hash
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter file hash or identifier..."
                value={customFileHash}
                onChange={(e) => setCustomFileHash(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFileHash();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateSampleHash}
                size="sm"
              >
                Generate Sample
              </Button>
              <Button
                type="button"
                onClick={addFileHash}
                disabled={!customFileHash.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* File Types Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Camera className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-sm">Photos</div>
                <div className="text-xs text-muted-foreground">
                  Site photos, specimen images
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Image className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-sm">Data Files</div>
                <div className="text-xs text-muted-foreground">
                  CSV, Excel, lab results
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <div className="font-medium text-sm">Documents</div>
                <div className="text-xs text-muted-foreground">
                  Reports, protocols, permits
                </div>
              </div>
            </div>
          </div>

          {/* Selected File Hashes Display */}
          {fileHashes.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <File className="h-4 w-4" />
                Attached Files ({fileHashes.length})
              </h4>
              <div className="space-y-2">
                {fileHashes.map((hash: string, index: number) => (
                  <div
                    key={hash}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm font-mono">{hash}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFileHash(hash)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Form Field */}
          <FormField
            control={control}
            name="fileHashes"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Important Information Card */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-amber-900">
                Data Integrity Notice
              </h4>
              <p className="text-sm text-amber-800">
                All submitted data will be cryptographically hashed and stored
                on the blockchain for verification. Ensure all information is
                accurate before final submission as records cannot be modified
                after blockchain storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
