# Design QA — Achievements

- Source visual truth: Figma `Свайпик`, node `3056:382`
- Reference: https://www.figma.com/design/8WgoeU1xXB972SIvWlpqW3/?node-id=3056-382
- Reference screenshot: `/private/tmp/swipik-achievements/figma-reference.png`
- Implementation screenshot: `/private/tmp/swipik-achievements/implementation.png`
- Comparison image: `/private/tmp/swipik-achievements/comparison.png`
- Primary viewport: 393 × 852 CSS px

## Scope

The achievements screen was matched to the Figma frame while retaining the
existing shared segmented control and bottom navigation, as requested.

## Verified

- Figma promo block, copy, spacing, glass cards, typography, and imagery.
- Fourteen achievement cards are rendered from the Figma catalog.
- All fourteen local achievement images load successfully.
- Existing API percentages remain authoritative for matching keys:
  `pioneer` 1%, `first` 100%, and `dislikes` 3%.
- Cards absent from the original project were added.
- The full list scrolls to the final `Инвестор` card without being obscured by
  the bottom navigation.
- Responsive checks passed at 320px, 393px, and 430px widths.
- No horizontal page overflow and no browser console errors were found.

## Intentional differences

- The segmented control is the previously approved shared implementation.
- The bottom navigation is the previously approved application navigation.

## Result

Final result: passed.
