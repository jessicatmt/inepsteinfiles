# Design Guidelines: Epstein Files Search

## Design Approach

**Reference-Based Design** inspired by isabevigodadead.com's bold simplicity, combined with modern social sharing capabilities.

**Key Principles:**
- Immediate, unmistakable answer delivery
- Bold typography that dominates the viewport
- Single-purpose clarity with progressive disclosure
- Humorous yet respectful execution
- Zero-friction social sharing

---

## Typography Hierarchy

**Primary Answer Display:**
- Display font at 6rem (desktop) / 3rem (mobile)
- Ultra-bold weight (800-900)
- Letter-spacing: -0.02em for impact
- Line-height: 1.1 for tight, powerful statements

**Secondary Information:**
- Body text: 1.125rem (18px)
- Medium weight (500-600)
- Line-height: 1.6 for readability
- Document links: 1rem with underline on hover

**Supporting Text:**
- Labels and metadata: 0.875rem (14px)
- Regular weight (400)

---

## Layout System

**Spacing Scale:** Use Tailwind units of 4, 6, 8, 12, 16, 24 for consistent rhythm

**Main Answer Screen:**
- Full viewport centered layout (min-h-screen flex items-center justify-center)
- Max-width container: max-w-4xl
- Generous vertical padding: py-24 (desktop) / py-16 (mobile)
- Answer text centered with mb-8 below

**Result Details Section:**
- Appears below answer on same page (not separate screen)
- Max-width: max-w-3xl
- Card-based layout for document references
- Horizontal padding: px-6 (mobile) / px-8 (desktop)

**Document Links Area:**
- Stacked cards with py-4 spacing between
- Each card: p-6, rounded corners
- Clear visual separation from answer section

---

## Component Library

### Core Components

**Answer Display:**
- Massive text: "NO" or "YES"
- Name displayed above in smaller text (2rem)
- Subtitle clarifying the search (1.25rem)
- Example: "Michael Jordan" (2rem) → "is NOT in the Epstein files" (1.25rem) → "NO" (6rem)

**Search Input (Optional Pre-Search State):**
- Large centered input field (text-xl, p-4)
- Placeholder: "Enter any name..."
- Submit button integrated or Enter key
- Max-width: max-w-md

**Share Card Generator:**
- Fixed aspect ratio container (1200x630 for social)
- Answer prominently displayed
- Site branding footer
- Download button: "Download Image" or "Share on X/Twitter"
- Preview shown inline before download

**Document Reference Cards:**
- Document title as heading (font-semibold, text-lg)
- Excerpt snippet showing context (italic, text-base)
- Direct link to PDF with page number
- Metadata: date, source, page reference
- Hover state: subtle lift effect (hover:translate-y-[-2px])

**URL Copy Button:**
- Positioned near top or after answer
- Icon + "Copy Link" text
- Success state: "Copied!" with checkmark
- Minimal style, secondary action treatment

### Navigation

**Header (Minimal):**
- Site logo/title top-left: "In The Epstein Files?"
- About/How it works link top-right
- Height: h-16
- Sticky positioning on scroll (sticky top-0)
- Subtle border-bottom for definition

**Footer:**
- Full-width at page bottom
- Links to sources, methodology, disclaimer
- Social media icons if applicable
- Copyright and credits
- Padding: py-12

---

## Page Structure

**Single-Page Layout Flow:**

1. **Hero/Answer Section** (100vh minimum)
   - Centered answer display
   - Name and result
   - Share button prominent

2. **Document Results** (if YES)
   - Transition from answer with py-16 spacing
   - "Found in X documents:" heading
   - Stacked document cards
   - Each card shows excerpt + link

3. **Explanation Section** (appears for all results)
   - "How this works" expandable
   - Data sources listed
   - Last updated timestamp
   - Methodology transparency

4. **Footer**

---

## Interactive Elements

**Primary CTA (Share/Download):**
- Large button: px-8 py-4
- Rounded: rounded-lg
- Font: font-semibold text-lg
- Positioned below answer

**Secondary Actions:**
- Text links with arrow icons
- Hover: subtle underline
- Icon transitions on hover

**Copy URL Functionality:**
- Floating or inline button
- Toast notification on success
- Auto-fade after 3s

---

## Responsive Behavior

**Desktop (1024px+):**
- Answer text: 6rem
- Two-column layout for document cards (if multiple)
- Generous whitespace

**Tablet (768px - 1023px):**
- Answer text: 4rem
- Single column
- Reduced padding

**Mobile (<768px):**
- Answer text: 3rem
- Stack all elements
- Full-width cards with px-4 padding
- Touch-friendly button sizes (min 44px height)

---

## Animation & Micro-interactions

**Use Sparingly:**
- Answer reveal: Simple fade-in on load (duration-500)
- Document cards: Stagger entrance if multiple (delay-100, delay-200)
- Button states: Scale on press (active:scale-95)
- Copy success: Subtle checkmark animation

**No Continuous Animations:**
- Avoid parallax, scroll-jacking, or persistent motion
- Keep interactions immediate and purposeful

---

## Image Strategy

**Share Card Image:**
- Auto-generated canvas/SVG graphic
- Bold answer text centered
- Minimal branding
- High contrast for readability
- Export as PNG (1200x630px for social)

**No Hero Image:**
- This is a utility tool, not a marketing page
- Focus remains on the answer typography
- Background is solid or subtle texture only

---

## Content Tone

**Answer States:**
- **NO:** "NO, [Name] is NOT in the Epstein files" - Clear, definitive
- **YES:** "YES, [Name] appears in the Epstein files" - Factual, serious
- Supporting text maintains informative tone
- Document excerpts shown verbatim with source attribution

**Call-to-Action:**
- "Share this result"
- "Download and post"
- "Check another name"