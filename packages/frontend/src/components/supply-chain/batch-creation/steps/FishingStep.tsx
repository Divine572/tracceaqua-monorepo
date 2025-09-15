"use client";

import { useFormContext, useFieldArray } from "react-hook-form";

export default function FishingStep() {
  const { register, control } = useFormContext();

  const { fields, append } = useFieldArray({
    control,
    name: "fishingData.catchComposition",
  });

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Fishing Data</h2>

      <label className="block mb-2">
        Latitude
        <input
          {...register("fishingData.coordinates.latitude")}
          className="border px-2 py-1 w-full"
        />
      </label>

      <label className="block mb-2">
        Longitude
        <input
          {...register("fishingData.coordinates.longitude")}
          className="border px-2 py-1 w-full"
        />
      </label>

      <label className="block mb-2">
        Vessel Name
        <input
          {...register("fishingData.vesselDetails.vesselName")}
          className="border px-2 py-1 w-full"
        />
      </label>

      <label className="block mb-2">
        Registration Number
        <input
          {...register("fishingData.vesselDetails.registrationNumber")}
          className="border px-2 py-1 w-full"
        />
      </label>

      <div>
        <h3 className="font-semibold">Catch Composition</h3>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 mb-2">
            <input
              {...register(`fishingData.catchComposition.${index}.species`)}
              placeholder="Species"
              className="border px-2 py-1 flex-1"
            />
            <input
              {...register(`fishingData.catchComposition.${index}.quantity`)}
              placeholder="Quantity"
              className="border px-2 py-1 flex-1"
            />
          </div>
        ))}
        <button
          type="button"
          className="px-2 py-1 bg-gray-200 rounded"
          onClick={() => append({ species: "", quantity: "" })}
        >
          + Add Species
        </button>
      </div>
    </div>
  );
}
