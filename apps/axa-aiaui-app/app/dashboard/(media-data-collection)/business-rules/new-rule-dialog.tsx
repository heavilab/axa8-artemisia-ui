// components/ui/new-rule-dialog.tsx
"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface NewRuleDialogProps {
  onSubmit: (rule: {
    dataSource: string;
    agency: string;
    field: string;
    targetField: string;
    matchType: string;
    condition: string;
    results: string;
  }) => void;
}

const dataSources = [
  "googleanalytics",
  "piano",
  "cm360",
  "dv360",
  "googleads",
  "bingads",
  "outbrain",
  "facebookads",
  "linkedin",
  "searchads",
  "xandr",
  "snapchat",
  "amazon",
  "tiktok",
  "thetradedesk",
  "pinterest",
  "teads",
];

const fields = [
  "campaign_name",
  "line_item",
  "insertion_order",
  "adset_name",
  "campaign_platform",
  "creative_label",
  "placement",
  "adgroup_name",
];

const targetFields = [
  "node_name",
  "data_source",
  "advertiser",
  "agency",
  "entity",
  "funding_entity",
  "data_currency",
  "language",
  "country",
  "stream",
  "campaign_objective",
  "business_classification_1",
  "business_classification_2",
  "product",
  "media_level_1",
  "media_level_2",
  "mediapartner_saleshouse",
  "platform_or_publisher",
  "buying_mode",
  "buying_type",
  "start_date",
  "end_date",
  "date",
  "week",
  "targeting_type",
  "procurement_centralization",
  "media_target",
  "creative_type",
  "creative_format",
  "creative_duration",
  "location",
  "positioning",
  "daypart",
  "digital_radio_or_podcast",
  "national_or_local",
  "brand_non_brand",
  "ad_serving",
  "ad_verification",
  "video_or_audio_plays",
  "video_or_audio_completed",
];

export function NewRuleDialog({ onSubmit }: NewRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataSource, setDataSource] = useState("");
  const [agency, setAgency] = useState("");
  const [field, setField] = useState("");
  const [targetField, setTargetField] = useState("");
  const [matchType, setMatchType] = useState("");
  const [condition, setCondition] = useState("");
  const [results, setResults] = useState("");
  const [checked, setChecked] = useState(false);

  function resetForm() {
    setDataSource("");
    setAgency("");
    setField("");
    setTargetField("");
    setMatchType("");
    setCondition("");
    setResults("");
    setChecked(false);
  }

  function handleSubmit() {
    if (!checked) return;
    onSubmit({
      dataSource,
      agency,
      field,
      targetField,
      matchType,
      condition,
      results,
    });
    resetForm();
    setOpen(false);
  }

  function handleCheck() {
    // Dummy logic to simulate a check
    if (dataSource && agency && field && targetField && matchType) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Plus /> Add Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Rule</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Data Source</Label>
            <Select value={dataSource} onValueChange={setDataSource}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Agency</Label>
            <Select value={agency} onValueChange={setAgency}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OMD">OMD</SelectItem>
                <SelectItem value="Jakala">Jakala</SelectItem>
                <SelectItem value="axa-internal">axa-internal</SelectItem>
                <SelectItem value="<other…>">&lt;other…&gt;</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Field</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Target Field</Label>
            <Select value={targetField} onValueChange={setTargetField}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target field" />
              </SelectTrigger>
              <SelectContent>
                {targetFields.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Match Type</Label>
            <Select value={matchType} onValueChange={setMatchType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select match type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">default</SelectItem>
                <SelectItem value="regexp-contains">regexp-contains</SelectItem>
                <SelectItem value="calculation">calculation</SelectItem>
                <SelectItem value="regexp-extract">regexp-extract</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Condition</Label>
            <Input
              className="w-full"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Results</Label>
            <Input
              className="w-full"
              value={results}
              onChange={(e) => setResults(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="secondary" onClick={handleCheck}>
            Check
          </Button>
          <Button onClick={handleSubmit} disabled={!checked}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
