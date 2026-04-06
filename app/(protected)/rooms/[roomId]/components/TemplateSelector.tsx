"use client";

import { useState } from "react";
import { Editor } from "tldraw";
import { LayoutTemplate } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TEMPLATES } from "@/lib/tldraw/templates";

interface TemplateSelectorProps {
  editor: Editor | null;
  disabled?: boolean;
}

export function TemplateSelector({ editor, disabled }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  const handleApplyTemplate = (templateId: string) => {
    if (!editor) return;

    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const center = editor.getViewportPageBounds().center;

    editor.markHistoryStoppingPoint("insert-template");
    template.apply(editor, center);

    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || !editor}
          className="gap-2 shadow-sm"
        >
          <LayoutTemplate className="h-4 w-4" />
          Templates
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={20}
        className="w-140 p-4 shadow-2xl rounded-2xl border-gray-100 z-5001"
      >
        <div className="grid grid-cols-2 gap-4 mt-4">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:border-[#285a48] hover:shadow-md transition-all"
              onClick={() => handleApplyTemplate(template.id)}
            >
              <CardHeader>
                <CardTitle className="text-base text-[#285a48]">
                  {template.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {template.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
