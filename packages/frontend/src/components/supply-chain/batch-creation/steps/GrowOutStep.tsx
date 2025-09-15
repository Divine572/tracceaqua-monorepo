"use client";

import { useFormContext } from "react-hook-form";

export default function GrowOutStep() {
  const { register } = useFormContext();

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Grow Out Data</h2>
      <label className="block mb-2">
        Water Quality (pH)
        <input
          {...register("growOutData.waterQuality.pH")}
          className="border px-2 py-1 w-full"
          placeholder="Enter pH value"
        />
      </label>
      <label className="block mb-2">
        Water Quality (Dissolved Oxygen)
        <input
          {...register("growOutData.waterQuality.dissolvedOxygen")}
          className="border px-2 py-1 w-full"
          placeholder="Enter oxygen level"
        />
      </label>
    </div>
  );
}
