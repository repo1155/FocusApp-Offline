/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F4F7F6',
    tint: '#9DE7C6',

    // Core surfaces
    background: '#081A20',
    foreground: '#F4F7F6',

    // Cards / elevated surfaces
    card: '#102A30',
    cardForeground: '#F4F7F6',

    // Primary action color (buttons, links, active states)
    primary: '#9DE7C6',
    primaryForeground: '#0B252B',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#173940',
    secondaryForeground: '#D8EAE5',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#18343B',
    mutedForeground: '#91AAA7',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F3A98F',
    accentForeground: '#301A1B',

    // Destructive actions (delete, error states)
    destructive: '#F07F7C',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#24444A',
    input: '#24444A',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
