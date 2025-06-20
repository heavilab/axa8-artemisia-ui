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
import { Plus, Check } from "lucide-react";
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
  const [checkStatus, setCheckStatus] = useState<null | "checked" | string>(
    null
  );

  function resetForm() {
    setDataSource("");
    setField("");
    setTargetField("");
    setMatchType("");
    setCondition("");
    setResults("");
    setChecked(false);
  }

  function resetCheckStatus() {
    setCheckStatus(null);
    setChecked(false);
  }

  function handleDataSource(val: string) {
    setDataSource(val);
    resetCheckStatus();
  }
  function handleField(val: string) {
    setField(val);
    resetCheckStatus();
  }
  function handleTargetField(val: string) {
    setTargetField(val);
    resetCheckStatus();
  }
  function handleMatchType(val: string) {
    setMatchType(val);
    resetCheckStatus();
  }
  function handleCondition() {
    setCondition("");
    resetCheckStatus();
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
    if (!(dataSource && field && targetField && matchType)) {
      setCheckStatus(null);
      setChecked(false);
      return;
    }
    // Helper to check quoted string and extract inside
    const isQuoted = (str: string) =>
      str.startsWith('"') && str.endsWith('"') && str.length > 1;
    const insideQuotes = (str: string) => str.slice(1, -1);
    if (matchType === "regexp-contains" || matchType === "regexp-extract") {
      if (!condition.trim()) {
        setCheckStatus("Enter a test string in condition");
        setChecked(false);
        return;
      }
      if (!results.trim() || !isQuoted(results.trim())) {
        setCheckStatus("Results must be a quoted regexp");
        setChecked(false);
        return;
      }
      let regexp;
      try {
        regexp = new RegExp(insideQuotes(results.trim()));
      } catch {
        setCheckStatus("Invalid regexp in results");
        setChecked(false);
        return;
      }
      if (!regexp.test(condition.trim())) {
        setCheckStatus("The regexp does not match the test string");
        setChecked(false);
        return;
      }
    } else if (matchType === "calculation") {
      if (!condition.trim()) {
        setCheckStatus("Enter a calculation rule in condition");
        setChecked(false);
        return;
      }
    } else if (matchType === "default") {
      if (!results.trim()) {
        setCheckStatus("Enter a default value in results");
        setChecked(false);
        return;
      }
    }
    setCheckStatus("checked");
    setChecked(true);
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
              onChange={handleDataSource}
              placeholder="Select data source"
            />
          </div>
          <div className="grid gap-2">
            <Combobox
              label="Field"
              options={toOptions(fields)}
              value={field}
              onChange={handleField}
              placeholder="Select field"
            />
          </div>
          <div className="grid gap-2">
            <Combobox
              label="Target Field"
              options={toOptions(targetFields)}
              value={targetField}
              onChange={handleTargetField}
              placeholder="Select target field"
            />
          </div>
          <div className="grid gap-2">
            <Label>Match Type</Label>
            <Select value={matchType} onValueChange={handleMatchType}>
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
              onChange={handleCondition}
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
          {checkStatus === "checked" ? (
            <Button
              variant="secondary"
              disabled
              className="opacity-70 cursor-default"
            >
              <Check className="w-4 h-4 mr-1" /> Checked
            </Button>
          ) : (
            <Button variant="secondary" onClick={handleCheck}>
              Check
            </Button>
          )}
          {checkStatus && checkStatus !== "checked" && (
            <span className="text-destructive text-sm ml-2">{checkStatus}</span>
          )}
          <Button onClick={handleSubmit} disabled={!checked}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
