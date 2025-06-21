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
import { useState } from "react";
import { Combobox } from "@/components/ui/combobox";
import { Plus } from "lucide-react";

const COUNTRIES = ["ES"];

const ENTITIES = ["ESAXA", "ESALL"];

const AGENCIES = ["OMD", "Jakala"];

export function CreateDraftDialog({
  onCreate,
  onRefresh,
}: {
  onCreate: (info: {
    agency: string;
    entity: string;
    country: string;
  }) => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const countryOptions = COUNTRIES.map((code) => ({
    value: code,
    label: code.toUpperCase(),
  }));
  const entityOptions = ENTITIES.map((e) => ({ value: e, label: e }));
  const agencyOptions = AGENCIES.map((a) => ({ value: a, label: a }));

  const [agency, setAgency] = useState("");
  const [entity, setEntity] = useState("");
  const [country, setCountry] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="cursor-pointer">
          <Plus /> Create Draft
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Draft</DialogTitle>
          <p className="text-sm text-muted-foreground">
            This will create a draft by copying all business rules from the
            current <strong>Main</strong> version.
          </p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Combobox
            label="Country"
            options={countryOptions}
            value={country}
            onChange={setCountry}
          />
          <Combobox
            label="Entity"
            options={entityOptions}
            value={entity}
            onChange={setEntity}
          />
          <Combobox
            label="Agency"
            options={agencyOptions}
            value={agency}
            onChange={setAgency}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!agency || !entity || !country || loading}
            onClick={async () => {
              setLoading(true);
              await onCreate({ agency, entity, country });
              await onRefresh();
              setLoading(false);
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
