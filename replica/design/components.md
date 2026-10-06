# Components (Stitch clone, mobile-first)

Global rules: real semantic elements; every interactive target >= 44x44px; visible focus ring (2px accent, offset 2px);
content wraps (`min-width:0`, `overflow-wrap:anywhere`), never forces page width; respect `prefers-reduced-motion`;
safe-area insets on fixed bars. Icons: Lucide (MIT). Font: Inter (open). All copy original.

Button
  variants  primary, secondary, ghost, danger
  sizes     md 44px (default on mobile), lg 52px; full-width option
  states    default, active, focus-visible, disabled (aria-disabled), loading (spinner, label kept for screen readers)
  tokens    primary bg accent / text on-accent, radius md, type base 600
  used on   S02 S05 S06 S10

PromptBox
  parts     auto-growing textarea (max 6 lines, then internal scroll), attach-image button, mode chip, send button, char counter (4000)
  states    empty (send disabled), filled, uploading, over-limit (danger text + message), error, disabled while generating
  a11y      label "Describe your app screen"; Enter = newline on mobile, send button submits; counter via aria-live=polite
  used on   S02 S06

ModeSelect (bottom sheet on mobile)
  options   Ideate, Flash, Standard, Thinking; each with one-line description and quota group (standard/experimental)
  a11y      radiogroup; sheet traps focus, closes on Esc/backdrop/swipe-down
  used on   S02

DeviceToggle
  segmented control Mobile | Web, 44px segments; aria-pressed

ScreenFrame / PreviewFrame
  renders   sanitised HTML in <iframe sandbox="" srcdoc>, scaled by CSS transform to container width (fixed-width wrapper, height = scaled)
  states    loading skeleton, ready, error ("Couldn't render this screen" + retry), selected
  a11y      title="Preview: {screen title}"; frame itself focusable to open S05
  used on   S04 S05 S08

Canvas (mobile)
  layout    vertical stack of ScreenFrames with sticky screen-counter chip; alternative: horizontal scroll-snap carousel INSIDE its own
            container is NOT used (no horizontal scroll). Desktop >= 1024px may show a grid.
  states    empty (illustration + prompt CTA), 1-5 screens

BottomSheet
  replaces side panels; max-height 85dvh, internal vertical scroll, drag handle, safe-area padding; modal semantics

TabBar (bottom)
  tabs      Projects, Create, Usage (3 items, 56px + safe-area); aria-current=page; badge optional

AppHeader
  56px, title truncates with ellipsis, back button 44px, one overflow-menu button (opens BottomSheet)

ProjectCard
  thumbnail (first screen preview, lazy), name (2-line clamp), updated time; whole card is one link; overflow menu: rename, duplicate, delete (confirm sheet)
  states    loading skeleton, default, pressed

VariantGrid  2 columns at >=360px, 1 column below; select = radio semantics

TokenSwatch / DesignSystemView  swatch + role name + hex; copy button; markdown editor in a textarea with preview tab

ExportList  rows: HTML/CSS, Tailwind, DESIGN.md, (later) frameworks; each row 56px with Copy and Download; clipboard-denied falls back to Download + message

UsageMeter  progress bar with text "{used} of {limit} this month"; role=progressbar; warning colour >= 80%, danger at limit

MicButton  44px, states idle / listening (pulse, reduced-motion safe) / permission-denied (message with how to enable)

Toast  bottom above TabBar, role=status, 4s, max width 100% - 2*gutter, wraps text
Modal/ConfirmSheet  destructive actions only; danger button last, Cancel first in DOM order
Skeleton  reduced-motion: static
Input/TextField  44px, label above, error text below with aria-describedby, border-input colour, font-size >= 16px (prevents iOS zoom)

Width test: every component story rendered at 320px must satisfy scrollWidth <= clientWidth.
