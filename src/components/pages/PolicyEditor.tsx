"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
    AlertCircle, Bold, Italic, UnderlineIcon, List, ListOrdered,
    Link as LinkIcon, Strikethrough, Quote, Minus, Undo, Redo, Code
} from "lucide-react";
import {
    useGetBusinessSettings,
    useSaveBusinessSettings,
} from "@/hooks/useBusinessSettings";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";
import { SettingsPageName } from "@/types";

interface PolicyEditorProps {
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
    pageName?: SettingsPageName;
    emptyMessageKey?: string;
    saveLabelKey?: string;
}

const PolicyEditor = ({
    onSuccess,
    onError,
    pageName = "privacyPolicy",
    emptyMessageKey = "enterPrivacyPolicyContent",
    saveLabelKey = "savePrivacyPolicy",
}: PolicyEditorProps) => {
    const t = useTranslations("translation");
    const { data, isLoading } = useGetBusinessSettings(pageName);
    const { mutate: save, isPending: isSaving } = useSaveBusinessSettings(pageName);

    const [error, setError] = useState<string | null>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
        ],
        content: "",
        editorProps: {
            attributes: {
                class: "min-h-[400px] px-4 py-3 text-sm text-gray-800 dark:text-gray-200 focus:outline-none prose prose-sm dark:prose-invert max-w-none",
            },
        },
    });

    useEffect(() => {
        if (editor && data?.data?.pageSettings?.content) {
            editor.commands.setContent(data.data.pageSettings.content);
        }
    }, [data, editor]);

    const handleSubmit = () => {
        if (!editor || editor.isEmpty) {
            return setError(t(emptyMessageKey));
        }
        setError(null);
        const content = editor.getHTML();
        save(
            { content },
            {
                onSuccess: (result) => onSuccess?.(result.data),
                onError: (err: any) => {
                    const msg = err?.response?.data?.message || "Failed to save. Please try again.";
                    setError(msg);
                    onError?.(msg);
                },
            }
        );
    };

    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
                ${isActive ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400" : ""}`}
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />;

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className={`rounded-xl border overflow-hidden ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}`}>

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">

                    {/* Headings */}
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                        <ToolbarButton
                            key={level}
                            title={`Heading ${level}`}
                            onClick={() => editor?.chain().focus().toggleHeading({ level: level as any }).run()}
                            isActive={editor?.isActive("heading", { level })}
                        >
                            <span className="text-xs font-bold w-6 h-4 flex items-center justify-center">H{level}</span>
                        </ToolbarButton>
                    ))}

                    <Divider />

                    {/* Text formatting */}
                    <ToolbarButton title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive("bold")}>
                        <Bold className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={editor?.isActive("italic")}>
                        <Italic className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()} isActive={editor?.isActive("underline")}>
                        <UnderlineIcon className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Strikethrough" onClick={() => editor?.chain().focus().toggleStrike().run()} isActive={editor?.isActive("strike")}>
                        <Strikethrough className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Inline Code" onClick={() => editor?.chain().focus().toggleCode().run()} isActive={editor?.isActive("code")}>
                        <Code className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Lists */}
                    <ToolbarButton title="Bullet List" onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={editor?.isActive("bulletList")}>
                        <List className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Ordered List" onClick={() => editor?.chain().focus().toggleOrderedList().run()} isActive={editor?.isActive("orderedList")}>
                        <ListOrdered className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Blockquote & HR */}
                    <ToolbarButton title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} isActive={editor?.isActive("blockquote")}>
                        <Quote className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Horizontal Rule" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
                        <Minus className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Link */}
                    <ToolbarButton
                        title="Link"
                        onClick={() => {
                            const url = window.prompt("Enter URL");
                            if (url) editor?.chain().focus().setLink({ href: url }).run();
                        }}
                        isActive={editor?.isActive("link")}
                    >
                        <LinkIcon className="w-4 h-4" />
                    </ToolbarButton>

                    <Divider />

                    {/* Undo / Redo */}
                    <ToolbarButton title="Undo" onClick={() => editor?.chain().focus().undo().run()}>
                        <Undo className="w-4 h-4" />
                    </ToolbarButton>
                    <ToolbarButton title="Redo" onClick={() => editor?.chain().focus().redo().run()}>
                        <Redo className="w-4 h-4" />
                    </ToolbarButton>
                </div>

                {/* Editor */}
                <div className="bg-white dark:bg-gray-900">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Save button */}
            <div className="pt-4">
                <Button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    variant="button"
                    className="w-full py-6"
                >
                    {isSaving ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t("saving")}</span>
                        </div>
                    ) : (
                        <span>{t(saveLabelKey)}</span>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default PolicyEditor;
