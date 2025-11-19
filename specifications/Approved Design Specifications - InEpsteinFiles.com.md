---
title: Approved Design Specifications - InEpsteinFiles.com
type: note
permalink: specifications/approved-design-specifications-in-epstein-files-com
tags:
- design
- approved
- specifications
- twitter-cards
---

# Approved Design Specifications - InEpsteinFiles.com

**Date:** 2024-11-19  
**Status:** APPROVED - Ready for implementation  
**Project:** inepsteinfiles

## Design Philosophy
- Bold, unmistakable answers (inspired by isabevigodadead.com)
- White background, black text (NOT dark theme)
- Massive typography for YES/NO
- Clean, minimal layout
- Mobile-first design
- Zero-friction sharing

## Typography
- **Font:** Public Sans (Google Fonts)
- **YES/NO Answer:** 8rem mobile, 14rem desktop (red #dc2626 for YES, black for NO)
- **Subtitle:** 2rem, uppercase, letter-spacing 0.05em
- **Match Count:** 1.5rem
- **Legal Disclaimer:** 0.75rem (smallest legally defensible size)

## Page Structure

### Homepage (index.html)
```
IS [input field] IN THE EPSTEIN FILES?
```

### YES Result Page
```
YES
[NAME] IS IN THE EPSTEIN FILES
[X] results so far
[Post on X button]
No wrongdoing is alleged or implied. We are literally just a search.
───────────────
Sources processed → click to open original file.
[Documents]
```

### NO Result Page
```
NO
[NAME] IS NOT IN THE EPSTEIN FILES
0 results so far
[Post on X button]
No wrongdoing is alleged or implied. We are literally just a search.
```

## Twitter/OG Cards
- **Size:** 1200×628px
- **YES:** Red text, "X mentions in official records"
- **NO:** Black text, "0 mentions in official records"
- **Alt text specified for accessibility**

## Social Sharing
**YES:** "[NAME] IS in the Epstein files. Thoughts? Sources: [vanity-url].inepsteinfiles.com"
**NO:** "[NAME] IS NOT in the Epstein files. Thoughts? Sources: [vanity-url].inepsteinfiles.com"

## URLs
- Display: bill-clinton.inepsteinfiles.com
- Actual: bill-clinton.inepsteinfiles.com?utm_source=x_share
- Canonical: inepsteinfiles.com/bill-clinton

## Key Decisions
1. White background (not dark theme)
2. Red for YES, Black for NO
3. Legal text: 0.75rem (smallest defensible)
4. "so far" always linked to about page
5. Vanity URLs for clean sharing
6. "Thoughts?" in share text for engagement
