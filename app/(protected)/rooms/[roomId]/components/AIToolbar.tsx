"use client";

import { useState } from "react";
import { Sparkles, Send, MessageSquare, Wand2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ActionState } from "../hooks/useDiagramAI";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AIToolbarProps {
  actionState: ActionState;
  disabled: boolean;
  explanation: string | null;
  setExplanation: (explanation: string | null) => void;
  onGenerate: (prompt: string, layout: "TB" | "LR") => Promise<void>;
  onExplain: () => void;
  onAutocomplete: () => void;
}
export function AIToolbar({
  actionState,
  disabled,
  explanation,
  setExplanation,
  onGenerate,
  onExplain,
  onAutocomplete,
}: AIToolbarProps) {
  const [prompt, setPrompt] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [layout, setLayout] = useState<"TB" | "LR">("TB");
  const isBusy = actionState !== "idle";

  const handleGenerate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim() || disabled || isBusy) return;

    await onGenerate(prompt, layout);
    setPrompt("");
    setPopoverOpen(false);
  };
  const handleExplainClick = () => {
    setPopoverOpen(false);
    onExplain();
  };
  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            size="icon"
            className="fixed left-6 top-1/2 -translate-y-1/2 z-5000 h-14 w-14 rounded-full shadow-2xl bg-[#285a48] hover:bg-[#408a71]"
          >
            {isBusy ? (
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            ) : (
              <Sparkles className="h-6 w-6 text-white" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="right"
          align="center"
          sideOffset={20}
          className="w-80 p-4 shadow-2xl rounded-2xl border-gray-100 z-5001"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-[#091413] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#285a48]" />
                Generate Diagram
              </h4>
              <form onSubmit={handleGenerate} className="flex flex-col gap-4">
                <Textarea
                  placeholder="e.g., AWS Architecture..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={disabled || isBusy}
                  className="h-9 focus-visible:ring-[#285a48] resize-none"
                />
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <Label
                      htmlFor="layout-direction"
                      className="text-[10px] uppercase tracking-wider text-gray-500 font-bold"
                    >
                      Diagram Direction
                    </Label>

                    <Select
                      value={layout}
                      disabled={disabled || isBusy}
                      onValueChange={(val: "TB" | "LR") => setLayout(val)}
                    >
                      <SelectTrigger
                        id="layout-direction"
                        className=" h-9 w-[130px]  text-xs"
                      >
                        <SelectValue placeholder="Layout" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-5002">
                        <SelectItem value="TB" className="text-xs">
                          Top to Bottom
                        </SelectItem>
                        <SelectItem className="text-xs" value="LR">
                          Left to Right
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    size={"lg"}
                    disabled={disabled || isBusy || !prompt.trim()}
                    className=" bg-[#285a48] text-white  hover:bg-[#091413] flex-1 h-13"
                  >
                    {actionState === "generating" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                        Generating..
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Generate
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-[#091413]">AI Tools</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExplainClick}
                  disabled={disabled || isBusy}
                  className="w-full text-xs text-[#091413] font-medium hover:bg-slate-50"
                >
                  {actionState === "explaining" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#285a48]" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-2 text-[#285a48]" />
                  )}
                  Explain
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onAutocomplete();
                  }}
                  disabled={disabled || isBusy}
                  className="w-full text-xs font-medium text-[#091413] hover:bg-slate-50"
                >
                  {actionState === "completing" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#285a48]" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2 text-[#285a48]" />
                  )}
                  Auto-complete
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {(explanation || actionState === "explaining") && (
        <Card className="fixed top-24 right-8 w-96 shadow-2xl border-gray-100 z-5000 flex flex-col max-h-[70vh]">
          <CardHeader className="flex-none flex flex-row items-center justify-between space-y-0 pb-3 border-b">
            <CardTitle className="text-lg font-bold text-[#285a48]">
              AI Analysis
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
              onClick={() => setExplanation(null)}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </Button>
          </CardHeader>
          <ScrollArea className="h-[calc(70vh-60px)] w-full">
            <CardContent className="p-6">
              {actionState === "explaining" ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full bg-[#285a48]/20" />
                  <Skeleton className="h-4 w-[90%] bg-gray-200" />
                  <Skeleton className="h-4 w-[95%] bg-gray-200" />
                  <Skeleton className="h-4 w-[80%] bg-gray-200" />
                  <Skeleton className="h-4 w-[85%] bg-gray-200" />
                  <Skeleton className="h-4 w-[92%]  bg-gray-200" />
                  <Skeleton className="h-4 w-[88%] bg-gray-200" />
                  <Skeleton className="h-10 w-full bg-[#285a48]/20 mt-10" />
                  <Skeleton className="h-4 w-[90%] bg-gray-200" />
                  <Skeleton className="h-4 w-[95%] bg-gray-200" />
                  <Skeleton className="h-4 w-[80%] bg-gray-200" />
                  <Skeleton className="h-4 w-[85%] bg-gray-200" />
                  <Skeleton className="h-4 w-[92%] mt-6 bg-gray-200" />
                  <Skeleton className="h-4 w-[88%] bg-gray-200" />
                </div>
              ) : (
                <div className="prose prose-sm text-gray-700 max-w-none prose-p:leading-relaxed [&_li>p]:m-0 [&_ul]:mt-2">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </>
  );
}
