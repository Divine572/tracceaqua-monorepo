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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Beaker,
  Plus,
  X,
  FlaskConical,
  Microscope,
  TestTube,
} from "lucide-react";

const predefinedTests = [
  "Heavy Metal Analysis",
  "Microplastic Detection",
  "Bacterial Count",
  "Genetic Sequencing",
  "Morphometric Analysis",
  "Tissue Histology",
  "Contaminant Screening",
  "Lipid Analysis",
  "Protein Analysis",
  "Age Determination",
  "Parasite Examination",
  "Reproductive Status",
];

export function LabTestsStep() {
  const { control, watch, setValue } = useFormContext();
  const [customTest, setCustomTest] = useState("");
  const labTests = watch("labTests") || [];

  const addPredefinedTest = (test: string) => {
    if (!labTests.includes(test)) {
      setValue("labTests", [...labTests, test]);
    }
  };

  const addCustomTest = () => {
    if (customTest.trim() && !labTests.includes(customTest.trim())) {
      setValue("labTests", [...labTests, customTest.trim()]);
      setCustomTest("");
    }
  };

  const removeTest = (testToRemove: string) => {
    setValue(
      "labTests",
      labTests.filter((test: string) => test !== testToRemove)
    );
  };

  return (
    <div className="space-y-6">
      {/* Lab Tests Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Laboratory Tests Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormDescription>
            Select the laboratory analyses required for your samples. This step
            is optional but helps with planning and tracking.
          </FormDescription>

          {/* Predefined Tests */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Common Laboratory Tests
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {predefinedTests.map((test) => (
                <div key={test} className="flex items-center space-x-2">
                  <Checkbox
                    id={test}
                    checked={labTests.includes(test)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        addPredefinedTest(test);
                      } else {
                        removeTest(test);
                      }
                    }}
                  />
                  <label
                    htmlFor={test}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {test}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Test Input */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Add Custom Test
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom laboratory test..."
                value={customTest}
                onChange={(e) => setCustomTest(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTest();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addCustomTest}
                disabled={!customTest.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Tests Display */}
          {labTests.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Microscope className="h-4 w-4" />
                Selected Tests ({labTests.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {labTests.map((test: string) => (
                  <Badge
                    key={test}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {test}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeTest(test)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Form Field for React Hook Form */}
          <FormField
            control={control}
            name="labTests"
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

      {/* Lab Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Laboratory Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Sample Preservation:</strong> Ensure samples are properly
              preserved according to the selected test requirements.
            </p>
            <p>
              <strong>Chain of Custody:</strong> Maintain proper documentation
              for all samples sent to laboratory facilities.
            </p>
            <p>
              <strong>Testing Timeline:</strong> Different tests may require
              varying processing times. Plan accordingly for project deadlines.
            </p>
            <p>
              <strong>Quality Control:</strong> Include blanks and duplicates as
              appropriate for your sampling protocol.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
