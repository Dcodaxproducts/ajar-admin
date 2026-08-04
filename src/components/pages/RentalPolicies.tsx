"use client";
import BxTabs from "../BxTabs";
import DamageLiabilityTerms from "../DamageLiabilityTerms";
import RentalDurationLimits from "../RentalDurationLimits";
import SecurityDepositRules from "../SecurityDepositRules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { useGetZones } from "@/hooks/useZones";
import { limit } from "@/config/constants";
import { useTranslations } from "next-intl";

const RentalPolicies = () => {
  const t = useTranslations("translation");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetZones({ page, limit });
  const [selectedZone, setSelectedZone] = useState<string | undefined>(
    undefined
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    string | undefined
  >(undefined);

  const zones = data?.data?.zones;
  const zoneSubCategories =
    zones?.find((zone: any) => zone._id === selectedZone)?.subCategories || [];

  const handleZoneChange = (zoneId: string) => {
    setSelectedZone(zoneId);
    setSelectedSubCategory(undefined);
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Select value={selectedZone} onValueChange={handleZoneChange}>
          <SelectTrigger disabled={isLoading || !zones?.length}>
            <SelectValue
              placeholder={isLoading ? t("loading") : t("selectZone")}
            />
          </SelectTrigger>
          <SelectContent>
            {zones?.map((zone: any) => (
              <SelectItem key={zone._id} value={zone._id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={selectedSubCategory}
          onValueChange={setSelectedSubCategory}
          disabled={!selectedZone || !zoneSubCategories.length}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                selectedZone ? t("selectSubCategory") : t("selectZone")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {zoneSubCategories.map((subCategory: any) => (
              <SelectItem key={subCategory._id} value={subCategory._id}>
                {subCategory.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>{" "}
      <p className="text-sm bg-amber-100 text-black p-2 rounded-md">
        ⚠️ {t("policyChangeNote")}
      </p>
      <>
        {selectedZone && selectedSubCategory && (
          <BxTabs
            defaultValue="security-deposit"
            tabs={[
              {
                label: "securityDepositRules",
                value: "security-deposit",
                content: (
                  <SecurityDepositRules
                    zone={selectedZone}
                    subCategory={selectedSubCategory}
                  />
                ),
              },
              {
                label: "damageLiabilityTerms",
                value: "damage-liability",
                content: (
                  <DamageLiabilityTerms
                    zone={selectedZone}
                    subCategory={selectedSubCategory}
                  />
                ),
              },
              {
                label: "rentalDurationLimits",
                value: "rental-duration",
                content: (
                  <RentalDurationLimits
                    zone={selectedZone}
                    subCategory={selectedSubCategory}
                  />
                ),
              },
            ]}
          />
        )}
      </>
    </div>
  );
};

export default RentalPolicies;
