// Declarations for payload richtext lexical helpers

declare module '@payloadcms/richtext-lexical/lexical' {
  export type SerializedEditorState = any;
}

declare module '@payloadcms/richtext-lexical/html' {
  import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
  export function convertLexicalToHTML(state: SerializedEditorState): string;
}
