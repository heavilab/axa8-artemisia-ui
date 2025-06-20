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
import { Combobox } from "@/components/ui/combobox";

interface NewRuleDialogProps {
  onSubmit: (rule: {
    dataSource: string;
    field: string;
    targetField: string;
    matchType: string;
    condition: string;
    results: string;
    agency: string;
  }) => void;
  agency: string;
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

export function NewRuleDialog({ onSubmit, agency }: NewRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataSource, setDataSource] = useState("");
  const [field, setField] = useState("");
  const [targetField, setTargetField] = useState("");
  const [matchType, setMatchType] = useState("");
  const [condition, setCondition] = useState("");
  const [results, setResults] = useState("");
  const [checked, setChecked] = useState(false);

  function resetForm() {
    setDataSource("");
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
      field,
      targetField,
      matchType,
      condition,
      results,
      agency,
    });
    resetForm();
    setOpen(false);
  }

  function handleCheck() {
    // Dummy logic to simulate a check
    if (dataSource && field && targetField && matchType) {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }

  // Helper to convert array to combobox options
  const toOptions = (arr: string[]) => arr.map((v) => ({ value: v, label: v }));

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
            <Combobox
              label="Data Source"
              options={toOptions(dataSources)}
              value={dataSource}
              onChange={setDataSource}
              placeholder="Select data source"
            />
          </div>
          <div className="grid gap-2">
            <Combobox
              label="Field"
              options={toOptions(fields)}
              value={field}
              onChange={setField}
              placeholder="Select field"
            />
          </div>
          <div className="grid gap-2">
            <Combobox
              label="Target Field"
              options={toOptions(targetFields)}
              value={targetField}
              onChange={setTargetField}
              placeholder="Select target field"
            />
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
