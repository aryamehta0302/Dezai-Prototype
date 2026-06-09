---
name: Academic Intelligence System
colors:
  surface: '#faf8ff'
  surface-dim: '#d8d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#ecedf9'
  surface-container-high: '#e6e7f3'
  surface-container-highest: '#e1e2ee'
  on-surface: '#191b24'
  on-surface-variant: '#424655'
  inverse-surface: '#2d3039'
  inverse-on-surface: '#eff0fc'
  outline: '#727787'
  outline-variant: '#c2c6d8'
  surface-tint: '#0057ce'
  primary: '#0057cd'
  on-primary: '#ffffff'
  primary-container: '#0d6efd'
  on-primary-container: '#ffffff'
  inverse-primary: '#b1c5ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#a63b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cf4b00'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b1c5ff'
  on-primary-fixed: '#001946'
  on-primary-fixed-variant: '#00419e'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#ffdbce'
  tertiary-fixed-dim: '#ffb599'
  on-tertiary-fixed: '#370e00'
  on-tertiary-fixed-variant: '#7f2b00'
  background: '#faf8ff'
  on-background: '#191b24'
  surface-variant: '#e1e2ee'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
---

## Brand & Style

The design system is engineered for a premium EdTech SaaS environment, blending institutional authority with modern technological agility. The brand personality is **Academic, Intelligent, and Systematic**. It avoids the "playful" tropes of consumer EdTech in favor of a **University-grade** aesthetic that commands respect from administrators while remaining highly functional for students.

The visual style is **Corporate Modern with a Focus on Information Architecture**. It utilizes ample white space (Spaciousness) to reduce cognitive load when viewing dense academic data. The emotional response should be one of "Clarity and Progress"—the interface should feel like a sophisticated tool that empowers the user to navigate complex educational pathways with ease.

## Colors

The palette is anchored in a spectrum of blues to evoke trust and intelligence. 
- **Primary Blue (#0D6EFD)** is used for high-level actions and core brand identity.
- **Deep Blue (#2563EB)** serves as the interactive state for navigation and hover effects, providing necessary depth.
- **Sky Blue (#38BDF8)** is used sparingly as an accent for data visualization highlights and progress indicators.
- **Surface & Backgrounds**: We utilize a cool-toned Light Gray/Blue (#F8FAFC) for the main canvas to differentiate the background from the pure white (#FFFFFF) surfaces of cards and containers.
- **Typography**: The Slate (#0F172A) text provides high legibility without the harshness of pure black, maintaining a premium, balanced feel.

## Typography

This design system uses a dual-font strategy to balance technical precision with readability. **Geist** is employed for headlines and labels to provide a clean, slightly technical "developer-grade" precision that feels modern. **Inter** is used for all body copy and long-form academic content, chosen for its exceptional legibility and systematic neutral tone.

Hierarchies are strictly enforced to ensure that dashboards (often containing complex data) are easily scannable. `Label-sm` uses uppercase styling for metadata and category headers to provide a clear visual break from narrative text.

## Layout & Spacing

The layout philosophy is built on a **Fixed-Fluid Hybrid Grid**. Content resides within a maximum container width of 1440px to ensure line lengths remain readable on ultra-wide monitors.

- **Desktop**: 12-column grid with 24px gutters and 48px side margins. 
- **Tablet**: 8-column grid with 20px gutters and 32px side margins.
- **Mobile**: 4-column grid with 16px gutters and 16px side margins.

We employ a "Spacious" rhythm. Dashboard widgets should use `spacing.md` (24px) for internal padding to maintain a premium feel. Avoid overcrowding elements; if a dashboard view feels cluttered, increase the vertical spacing between sections to `spacing.lg`.

## Elevation & Depth

This design system uses **Tonal Layering and Ambient Shadows** to create a sophisticated sense of depth without looking "heavy."

1.  **Level 0 (Background)**: #F8FAFC. The lowest layer.
2.  **Level 1 (Cards/Surfaces)**: #FFFFFF. These use a very soft, diffused shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.03)`.
3.  **Level 2 (Active/Hover)**: When a card or element is interacted with, it lifts slightly. The shadow becomes more pronounced: `0 10px 15px -3px rgba(15, 23, 42, 0.08)`.
4.  **Level 3 (Overlays/Modals)**: Modals use a heavy blur backdrop (backdrop-filter: blur(8px)) with a 20% opacity slate tint to focus the user's attention.

Avoid using borders for depth; use the subtle shifts in surface color and ambient shadows to define boundaries.

## Shapes

The design system utilizes **Rounded (xl)** corners to soften the professional tone and make the platform feel more accessible and contemporary. 

- **Cards and Modals**: Use `rounded-xl` (1.5rem / 24px) to create a distinct, modern container.
- **Buttons and Inputs**: Use `rounded-lg` (1rem / 16px) for a comfortable, ergonomic feel.
- **Chips/Badges**: Use pill-shaped (full radius) for status indicators to contrast against the more structured rectangular cards.

## Components

### Buttons
Primary buttons use the Primary Blue hex with white text. Hover states should transition smoothly (200ms) to Secondary Blue. Use a slight scale-down effect (scale: 0.98) on click to mimic tactile feedback.

### Cards
All dashboard units are housed in cards. Cards should have no border, a white background, and the Level 1 shadow. Headers within cards should use `headline-sm` with a bottom divider of 1px in a very light slate tint.

### Role-Based Dashboards
- **Student**: Focuses on progress tracking with large, circular Sky Blue progress indicators.
- **University Admin**: Focuses on data density, using "Data Tables" with Zebra-striping (alternating white and #F8FAFC) and Geist for numeric data.
- **Dezai Admin**: A high-level system health view using "Status Chips" (Success, Warning, Danger) with 10% opacity backgrounds and 100% opacity text colors.

### Inputs
Search bars and form fields use a 1px border (#E2E8F0) that transitions to Primary Blue on focus. Use "Inter" for input text to ensure clarity during data entry.

### Transitions
Utilize Framer Motion for "Staggered Entrance" animations. When a dashboard loads, cards should fade in and slide up (y: 20 to 0) with a 20ms delay between each element to create a sense of choreographed quality.