// ==============================================================================
// DREAM HOME (خانه آرمانی) - CMS & Visual Page Builder Types
// ==============================================================================

export type CMSElementType =
  | 'page'
  | 'section'
  | 'container'
  | 'row'
  | 'column'
  | 'text'
  | 'heading'
  | 'paragraph'
  | 'button'
  | 'link'
  | 'image'
  | 'icon'
  | 'svg'
  | 'badge'
  | 'card'
  | 'grid'
  | 'flex'
  | 'divider'
  | 'shape'
  | 'dot'
  | 'line'
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  | 'video'
  | 'iframe'
  | 'property-card'
  | 'agent-card'
  | 'testimonial'
  | 'stat'
  | 'counter'
  | 'navigation'
  | 'footer';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface CMSStyleProperties {
  // Layout
  display?: string;
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  gap?: string;
  zIndex?: number;

  // Flex / Grid
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: string;

  // Colors
  color?: string;
  backgroundColor?: string;
  borderColor?: string;

  // Background
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  gradient?: string;
  overlay?: string;

  // Border
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;

  // Shadow
  boxShadow?: string;
  boxShadowX?: string;
  boxShadowY?: string;
  boxShadowBlur?: string;
  boxShadowSpread?: string;
  boxShadowColor?: string;

  // Effects
  opacity?: number;
  transform?: string;
  scale?: number;
  rotate?: string;
  translate?: string;
  filter?: string;
  backdropFilter?: string;
}

export interface CMSResponsiveStyles {
  desktop: CMSStyleProperties;
  tablet?: Partial<CMSStyleProperties>;
  mobile?: Partial<CMSStyleProperties>;
}

export interface CMSElement {
  id: string;
  pageId: string;
  parentId: string | null;
  componentType: CMSElementType;
  editorKey: string;
  name: string;
  content: {
    text?: string;
    html?: string;
    src?: string;
    alt?: string;
    href?: string;
    iconName?: string;
    badgeText?: string;
    placeholder?: string;
    target?: string;
    meta?: Record<string, any>;
  };
  styles: CMSStyleProperties;
  responsiveStyles: CMSResponsiveStyles;
  sortOrder: number;
  isVisible: boolean;
  children?: CMSElement[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  currentVersion: number;
  elements: CMSElement[];
  updatedAt: string;
  publishedAt?: string;
  hasDraft?: boolean;
}

export interface CMSPageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  status: 'draft' | 'published' | 'archived';
  snapshot: CMSElement[];
  changeSummary: string;
  createdBy: string;
  createdAt: string;
}

export interface DesignToken {
  id: string;
  name: string;
  variableName: string; // e.g. --color-gold
  value: string;
  category: 'color' | 'font' | 'radius' | 'shadow' | 'spacing';
  description?: string;
}

export interface StylePreset {
  id: string;
  name: string;
  description?: string;
  targetType: CMSElementType;
  styles: CMSStyleProperties;
  createdAt: string;
}

export interface CMSAuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: string;
}
