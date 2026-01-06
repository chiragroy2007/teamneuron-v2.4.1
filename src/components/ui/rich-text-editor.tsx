import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import TiptapBold from '@tiptap/extension-bold';
import TiptapItalic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import TiptapCode from '@tiptap/extension-code';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Button } from './button';
import { Separator } from './separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Minus,
  Indent,
  Outdent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Type,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage, uploadBase64Image } from '@/utils/imageUpload';
import { useAuth } from '@/contexts/AuthContext';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  editable = true,
  className,
}) => {
  const { user } = useAuth();

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      TiptapBold,
      TiptapItalic,
      Strike,
      TiptapCode,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      HorizontalRule,
      HardBreak,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-700 underline',
        },
      }),
      Underline,
      TextStyle,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({
        types: [TextStyle.name, ListItem.name],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
          'dark:prose-invert prose-headings:font-bold prose-p:text-foreground prose-strong:text-foreground',
          'prose-code:text-foreground prose-pre:bg-muted prose-blockquote:text-muted-foreground',
          'prose-li:text-foreground prose-a:text-primary hover:prose-a:text-primary/80',
          // Explicit heading styles to ensure they work
          'prose-h1:text-3xl prose-h1:font-bold prose-h1:leading-tight prose-h1:mb-4',
          'prose-h2:text-2xl prose-h2:font-bold prose-h2:leading-tight prose-h2:mb-3',
          'prose-h3:text-xl prose-h3:font-bold prose-h3:leading-tight prose-h3:mb-2',
          'prose-h1:text-foreground prose-h2:text-foreground prose-h3:text-foreground'
        ),
      },
      // Let TipTap handle all paste events normally
    },
  });

  // Handle image paste separately to not interfere with text paste
  useEffect(() => {
    if (!editor || !user) return;

    const handlePaste = async (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items || []);
      const imageItem = items.find(item => item.type.indexOf('image') === 0);

      if (imageItem) {
        event.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          // Show loading state
          editor.chain().focus().setImage({
            src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJWNk0xMiAxOFYyMk02IDEySDJNMjIgMTJIMThNMTkuMDcgMTkuMDdMMTYuMjQgMTYuMjRNMTkuMDcgNC45M0wxNi4yNCA3Ljc2TTQuOTMgMTkuMDdMNy43NiAxNi4yNE00LjkzIDQuOTNMNy43NiA3Ljc2IiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=',
            alt: 'Uploading...'
          }).run();

          try {
            const result = await uploadImage(file, user.id);

            if (result.success && result.url) {
              // Replace the loading image with the actual uploaded image
              const currentContent = editor.getHTML();
              const updatedContent = currentContent.replace(
                /data:image\/svg\+xml;base64,[^"]+/,
                result.url
              );
              editor.commands.setContent(updatedContent);

              if (onChange) {
                onChange(updatedContent);
              }
            } else {
              // Remove the loading image on error
              const currentContent = editor.getHTML();
              const updatedContent = currentContent.replace(
                /<img[^>]*data:image\/svg\+xml;base64,[^>]*>/g,
                ''
              );
              editor.commands.setContent(updatedContent);

              console.error('Image upload failed:', result.error);
              alert('Failed to upload image: ' + result.error);
            }
          } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image');
          }
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste);

    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor, user, onChange]);

  const addImage = useCallback(() => {
    if (!user) {
      alert('You must be logged in to upload images');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && editor) {
        try {
          const result = await uploadImage(file, user.id);

          if (result.success && result.url) {
            editor.chain().focus().setImage({ src: result.url }).run();
          } else {
            alert('Failed to upload image: ' + result.error);
          }
        } catch (error) {
          console.error('Image upload error:', error);
          alert('Failed to upload image');
        }
      }
    };
    input.click();
  }, [editor, user]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {editable && (
        <div className="border-b bg-muted/50 p-2">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text Formatting */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-muted' : ''}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-muted' : ''}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'bg-muted' : ''}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'bg-muted' : ''}
            >
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'bg-muted' : ''}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={editor.isActive('highlight') ? 'bg-muted' : ''}
            >
              <Highlighter className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Headings */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Font Size Selector */}
            <Select
              value={editor.getAttributes('textStyle').fontSize || 'default'}
              onValueChange={(value) => {
                if (value === 'default') {
                  editor.chain().focus().unsetMark('textStyle').run();
                } else {
                  editor.chain().focus().setMark('textStyle', { fontSize: value }).run();
                }
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <Type className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="14px">14px</SelectItem>
                <SelectItem value="16px">16px</SelectItem>
                <SelectItem value="18px">18px</SelectItem>
                <SelectItem value="20px">20px</SelectItem>
                <SelectItem value="24px">24px</SelectItem>
                <SelectItem value="32px">32px</SelectItem>
              </SelectContent>
            </Select>

            {/* Text Color */}
            <input
              type="color"
              value={editor.getAttributes('textStyle').color || '#000000'}
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              className="w-8 h-8 border border-border rounded cursor-pointer"
              title="Text Color"
            />

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Text Alignment */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Indentation */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (editor.isActive('listItem')) {
                  editor.chain().focus().sinkListItem('listItem').run();
                } else {
                  editor.chain().focus().insertContent('&nbsp;&nbsp;&nbsp;&nbsp;').run();
                }
              }}
            >
              <Indent className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (editor.isActive('listItem')) {
                  editor.chain().focus().liftListItem('listItem').run();
                }
              }}
              disabled={!editor.isActive('listItem')}
            >
              <Outdent className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Lists */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={editor.isActive('taskList') ? 'bg-muted' : ''}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'bg-muted' : ''}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <Minus className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Media & Links */}
            <Button type="button" variant="ghost" size="sm" onClick={setLink}>
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addImage}>
              <ImageIcon className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Undo/Redo - Removed due to missing History extension */}
          </div>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          'min-h-[200px] max-w-none',
          !editable && 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto p-4 dark:prose-invert',
          // Ensure headings work in both modes
          '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-4',
          '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:mb-3',
          '[&_h3]:text-xl [&_h3]:font-bold [&_h3]:leading-tight [&_h3]:mb-2',
          '[&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground',
          // Support for task lists and alignment
          '[&_ul[data-type="taskList"]]:list-none [&_li[data-type="taskItem"]]:flex [&_li[data-type="taskItem"]]:items-start',
          '[&_li[data-type="taskItem"]>label]:flex [&_li[data-type="taskItem"]>label]:items-center [&_li[data-type="taskItem"]>label]:mr-2',
          '[&_li[data-type="taskItem"]>label>input]:mr-2',
          '[&_.ProseMirror]:focus:outline-none'
        )}
      />
    </div>
  );
};

export default RichTextEditor;