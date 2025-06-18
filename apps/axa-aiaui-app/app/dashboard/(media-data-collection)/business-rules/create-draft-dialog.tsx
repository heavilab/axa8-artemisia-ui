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

const COUNTRIES = [
  "dz",
  "be",
  "cn",
  "eg",
  "fr",
  "de",
  "gb",
  "hk",
  "id",
  "ie",
  "xi",
  "it",
  "jp",
  "mx",
  "ma",
  "ng",
  "ph",
  "es",
  "ch",
  "th",
  "tr",
  "zz",
];

const ENTITIES = [
  "axa-dz-dommage",
  "axa-dz-vie",
  "axa-sa",
  "axa-be",
  "yuzzu-be",
  "axa-be-im",
  "axa-tianping",
  "axa-eg-life",
  "axa-eg-health",
  "axa-france",
  "axa-prevention",
  "axa-banque",
  "axa-germany",
  "axa-uk",
  "axa-uk-insurance",
  "axa-uk-health",
  "axa-hongkong",
  "axa-id-mandiri",
  "axa-id-afi",
  "axa-ie-roi",
  "axa-ie-ni",
  "axa-italy",
  "axa-jp-adj",
  "axa-jp-alj",
  "axa-mexico",
  "axa-morocco",
  "axa-ng-onehealth",
  "axa-ng-health",
  "axa-ng-insurance",
  "axa-ng-investment",
  "axa-philippines",
  "axa-es-aurora",
  "axa-es-seguros",
  "axa-switzerland",
  "axa-th-krungthai",
  "axa-tr-sigorta",
  "axa-tr-hayat",
  "axa-sa",
];

const AGENCIES = [
  "OMD",
  "Jakala",
  "Wavemaker",
  "blue2purple",
  "Mindshare",
  "Webrepublic",
  "axa-internal",
  "Pulse",
  "Heart&science",
  "Dentsudigital",
  "<other…>",
];

export function CreateDraftDialog({
  onCreate,
}: {
  onCreate: (info: { agency: string; entity: string; country: string }) => void;
}) {
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
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
            disabled={!agency || !entity || !country}
            onClick={() => onCreate({ agency, entity, country })}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
