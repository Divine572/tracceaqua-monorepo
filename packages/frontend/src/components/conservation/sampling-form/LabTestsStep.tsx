"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Beaker,
  Plus,
  X,
  FlaskConical,
  TestTube,
  Info,
  Calendar,
} from "lucide-react";

const commonTests = [
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

interface LabTest {
  testType?: string;
  results?: string;
  units?: string;
  testDate?: string; // ISO string
  laboratoryName?: string;
  referenceValues?: string;
}

export function LabTestsStep() {
  const { control, watch, setValue } = useFormContext();
  const [customTest, setCustomTest] = useState("");
  const labTests: LabTest[] = watch("labTests") || [];

  const addTest = (testName: string) => {
    if (!labTests.some((test) => test.testType === testName)) {
      const newTest: LabTest = {
        testType: testName,
        units: "",
        referenceValues: "",
      };
      setValue("labTests", [...labTests, newTest]);
    }
  };

  const removeTest = (testName: string) => {
    setValue(
      "labTests",
      labTests.filter((test) => test.testType !== testName)
    );
  };

  const addCustomTest = () => {
    if (
      customTest.trim() &&
      !labTests.some((test) => test.testType === customTest.trim())
    ) {
      addTest(customTest.trim());
      setCustomTest("");
    }
  };

  const updateTestField = (
    testName: string,
    field: keyof LabTest,
    value: string
  ) => {
    const updatedTests = labTests.map((test) =>
      test.testType === testName ? { ...test, [field]: value } : test
    );
    setValue("labTests", updatedTests);
  };

  return (
    <div className="space-y-6">
      {/* Main Lab Tests Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Laboratory Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormDescription>
            Select laboratory analyses for your samples. This is optional but
            helps with planning and tracking research objectives.
          </FormDescription>

          {/* Quick Test Selection */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Common Tests
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {commonTests.map((test) => {
                const isSelected = labTests.some(
                  (lt) => lt.testType === test
                );
                return (
                  <div key={test} className="flex items-center space-x-2">
                    <Checkbox
                      id={test}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addTest(test);
                        } else {
                          removeTest(test);
                        }
                      }}
                    />
                    <label
                      htmlFor={test}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {test}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Test Input */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Add Custom Test
            </h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter test name..."
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
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Tests */}
          {labTests.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">
                Selected Tests ({labTests.length})
              </h4>
              <div className="space-y-3">
                {labTests.map((test) => (
                  <div
                    key={test.testType}
                    className="border rounded-lg p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{test.testType}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTest(test.testType!)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Expected Results */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          Expected Results
                        </label>
                        <Textarea
                          placeholder="Expected outcomes..."
                          value={test.results || ""}
                          onChange={(e) =>
                            updateTestField(
                              test.testType!,
                              "results",
                              e.target.value
                            )
                          }
                          className="min-h-[60px] text-sm"
                        />
                      </div>

                      <div className="space-y-3">
                        {/* Laboratory */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">
                            Laboratory
                          </label>
                          <Input
                            placeholder="Lab name..."
                            value={test.laboratoryName || ""}
                            onChange={(e) =>
                              updateTestField(
                                test.testType!,
                                "laboratoryName",
                                e.target.value
                              )
                            }
                            className="text-sm"
                          />
                        </div>

                        {/* Date */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Test Date
                          </label>
                          <Input
                            type="date"
                            value={
                              test.testDate
                                ? test.testDate.split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              updateTestField(
                                test.testType!,
                                "testDate",
                                e.target.value
                                  ? new Date(
                                      e.target.value
                                    ).toISOString()
                                  : ""
                              )
                            }
                            className="text-sm"
                          />
                        </div>

                        {/* Units + Reference */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              Units
                            </label>
                            <Input
                              placeholder="mg/kg"
                              // value={test.units || ""}
                              onChange={(e) =>
                                updateTestField(
                                  test.testType!,
                                  "units",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                              Reference
                            </label>
                            <Input
                              placeholder="< 0.5"
                              // value={test.referenceValues || ""}
                              onChange={(e) =>
                                updateTestField(
                                  test.testType!,
                                  "referenceValues",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden field for react-hook-form */}
          <FormField
            control={control}
            name="labTests"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} value="" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p>
                <strong>Planning Tip:</strong> Adding lab tests helps track
                research objectives and ensures proper sample handling
                protocols.
              </p>
              <p>
                You can always modify test details later as your research
                progresses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
