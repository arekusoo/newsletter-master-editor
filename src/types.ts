/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BlockType = 'text' | 'image' | 'icon' | 'divider' | 'column-layout' | 'button' | 'emoji';

export interface TextBlockData {
  content: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
}

export interface ImageBlockData {
  url: string;
  alt: string;
  borderRadius: number;
  width: number;
  linkUrl?: string;
}

export interface IconBlockData {
  iconName: string;
  size: 'small' | 'medium' | 'large';
  color: string;
  backgroundColor: string;
  isCircular: boolean;
}

export interface DividerBlockData {
  color: string;
  thickness: number;
  paddingY: number;
}

export interface ButtonBlockData {
  text: string;
  url: string;
  backgroundColor: string;
  color: string;
  borderRadius: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  fullWidth: boolean;
  textAlign: 'left' | 'center' | 'right';
  variant?: 'button' | 'link';
}

export interface EmojiBlockData {
  emoji: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
}

export interface ColumnItem {
  type: 'text' | 'image' | 'icon' | 'button' | 'emoji' | 'empty';
  data: any;
}

export interface ColumnLayoutBlockData {
  columns: 2 | 3;
  items: ColumnItem[];
  borderRadius: number;
}

export interface NewsletterBlock {
  id: string;
  type: BlockType;
  data: any; // Discriminated by type
}

export interface NewsletterSettings {
  backgroundColor: string;
  contentBackgroundColor: string;
  fontFamily: 'Poppins' | 'Helvetica' | 'Open Sans' | 'sans-serif';
}

export interface Preset {
  id: string;
  name: string;
  blocks: NewsletterBlock[];
  settings: NewsletterSettings;
  createdAt: number;
}
