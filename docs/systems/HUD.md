# HUD and UI System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

The Heads-Up Display (HUD) is the player's **primary interface** with the game. It must convey essential information clearly while maintaining the retro aesthetic. The HUD should be **minimal, functional, and unobtrusive**.

This document covers:
- HUD layout and components
- Information hierarchy (what's always visible)
- Visual design and aesthetic
- Context-sensitive displays
- Menu systems
- Accessibility considerations

---

## Design Philosophy

**Retro Terminal Aesthetic:**
- Monospace fonts
- Monochrome or limited color (cyan, green, amber)
- Scanline effects (subtle, optional)
- CRT glow (very subtle)
- Inspired by 1980s-1990s computer terminals

**Information Density:**
- Show only what's needed
- No clutter or redundant info
- Context-sensitive (different displays for flying vs. docked)
- Toggle-able details (advanced info on demand)

**Functional Over Decorative:**
- No animated UI flourishes
- No "hacking" effects or glitches
- Clear, readable, functional
- Instant response to input

---

## HUD Layout

### Core HUD (Always Visible While Flying)

```
┌────────────────────────────────────────────────────────────────┐
│  VEL: 1,250 m/s          OPEN FRONTIER          FUEL: 875/1000 │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║                                                           ║ │
│  ║                                                           ║ │
│  ║                     [GAME VIEW]                           ║ │
│  ║                                                           ║ │
│  ║                                                           ║ │
│  ║                                                           ║ │
│  ║               [     CROSSHAIR     ]                       ║ │
│  ║                                                           ║ │
│  ║                                                           ║ │
│  ║                                                           ║ │
│  ║   TARGET: Earth Station Alpha                            ║ │
│  ║   DIST: 125,000 km | ETA: 2h 15m                         ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                  │
│  POS: Earth +125,000 km          THRUST: ████████░░ 80%         │
│  HULL: ██████████████████░░ 90%  TACHYON: 1,250x (MAX: 50,000x)│
└────────────────────────────────────────────────────────────────┘
```

### HUD Components

**Top Bar:**
- Left: Velocity (current speed)
- Center: Game title (can be replaced with messages)
- Right: Fuel gauge

**Center:**
- Game world view
- Crosshair (ship orientation indicator)
- Target information (if target selected)

**Bottom Bar:**
- Left: Position (reference body + offset)
- Left-bottom: Hull integrity
- Right: Thrust level
- Right-bottom: Tachyon multiplier

---

## Information Hierarchy

### Priority 1: Critical Flight Info (Always Visible)

**Velocity:** Current speed in m/s or km/s
- Format: `VEL: 1,250 m/s` or `VEL: 1.25 km/s`
- Updates in real-time
- Color: White (normal), Yellow (approaching target), Red (collision warning)

**Fuel:** Current fuel / max fuel
- Format: `FUEL: 875/1000`
- Updates in real-time
- Color: White (>25%), Yellow (10-25%), Red (<10%)

**Hull:** Integrity as percentage and bar
- Format: `HULL: ██████████████████░░ 90%`
- Updates when damaged
- Color: Green (>75%), Yellow (50-75%), Orange (25-50%), Red (<25%)

**Position:** Reference body and distance
- Format: `POS: Earth +125,000 km`
- Updates continuously
- Helps player orient in space

### Priority 2: Navigation Info (When Target Selected)

**Target Name:** What you're flying toward
- Format: `TARGET: Earth Station Alpha`
- Only visible when target selected

**Distance:** How far to target
- Format: `DIST: 125,000 km` or `DIST: 1.5 AU`
- Updates in real-time

**ETA:** Estimated time to arrival
- Format: `ETA: 2h 15m` or `ETA: 3d 6h`
- Based on current velocity and tachyon multiplier
- Updates dynamically

### Priority 3: Ship Status (Always Visible But Less Prominent)

**Thrust Level:** Current thrust percentage
- Format: `THRUST: ████████░░ 80%`
- Visual bar + percentage
- Shows player input

**Tachyon Multiplier:** Current FTL multiplier
- Format: `TACHYON: 1,250x (MAX: 50,000x)`
- Shows current multiplier and maximum available
- Critical for understanding travel speed

### Priority 4: Contextual Info (Situational)

**Docking Alignment:**
- Only visible near station
- Shows alignment error, velocity, rotation rate
- See "Docking HUD" section below

**Warnings:**
- Collision warning (when approaching object too fast)
- Low fuel warning
- Hull critical warning
- System malfunction (future)

---

## Docking HUD

### Additional Elements During Docking Approach

When within 10 km of station, docking HUD appears:

```
┌────────────────────────────────────────────────────────────────┐
│                       DOCKING APPROACH                           │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TARGET: Earth Station Alpha - Bay 03                           │
│                                                                  │
│  ╔═══════════════════════════════════════════════════════════╗ │
│  ║                                                           ║ │
│  ║                  [ STATION VISIBLE ]                      ║ │
│  ║                                                           ║ │
│  ║                    ▲ TARGET ORIENTATION                   ║ │
│  ║                    |                                      ║ │
│  ║                  +---+ SHIP                               ║ │
│  ║                    |                                      ║ │
│  ║                    ↓ CURRENT ORIENTATION                  ║ │
│  ║                                                           ║ │
│  ║                                                           ║ │
│  ╚═══════════════════════════════════════════════════════════╝ │
│                                                                  │
│  DISTANCE: 2,500 m                                               │
│  REL VEL:  15.3 m/s ⚠️ TOO FAST                                │
│  ALIGN:    8° ✓                                                  │
│  ROTATION: 0.05 rad/s ✓                                          │
│                                                                  │
│  [ REDUCE VELOCITY TO <2 m/s TO DOCK ]                          │
└────────────────────────────────────────────────────────────────┘
```

**Docking feedback:**
- Distance to port
- Relative velocity (color-coded: green <2 m/s, yellow 2-5 m/s, red >5 m/s)
- Alignment angle (green <15°, yellow 15-30°, red >30°)
- Rotation rate (green <0.1 rad/s, yellow 0.1-0.2, red >0.2)
- Clear instructions on what to fix

---

## Visual Design

### Typography

**Font:** Monospace (Courier New, Source Code Pro, or similar)
**Size:** 14-16px for body text, 12px for small info
**Weight:** Regular (not bold, except for warnings)

**Color Palette:**
- **Default text:** Cyan (#00FFFF)
- **Secondary text:** Green (#00FF00)
- **Warning text:** Yellow (#FFFF00)
- **Critical text:** Red (#FF0000)
- **Background:** Black (#000000) or dark gray (#111111)

**Effects (optional, toggle-able):**
- Subtle CRT scanlines (1-2px horizontal lines, 10% opacity)
- Very slight glow (1-2px blur on text)
- Slight chromatic aberration (0.5px RGB offset)

### Bars and Indicators

**Progress bars:**
```
████████████████░░░░ 80%
```
- Filled: █ (block character)
- Empty: ░ (light shade)
- 20 characters wide
- Color matches text

**Numeric displays:**
```
FUEL: 875 / 1000
VEL:  1,250 m/s
ETA:  2h 15m
```
- Right-aligned numbers for easy scanning
- Consistent spacing
- Units clearly labeled

---

## Context-Sensitive Displays

### Flying in Open Space

**Show:**
- Velocity, fuel, hull
- Position relative to nearest body
- Target info (if any)
- Tachyon multiplier
- Thrust level

**Hide:**
- Docking alignment
- Station-specific info
- Market prices

### Approaching Station

**Add:**
- Docking alignment indicators
- Relative velocity to station
- Docking clearance status
- Port assignment

**Keep:**
- All basic flight info

### Docked at Station

**Show:**
- Station name and services
- Menu options (Market, Missions, Repair, etc.)
- Your ship status (fuel, hull, cargo)
- Your credits

**Hide:**
- Flight controls
- Navigation info
- Velocity/thrust

---

## Menu Systems

### Main Menu (Docked)

```
╔════════════════════════════════════════════════════════╗
║                  EARTH STATION ALPHA                   ║
║                                                         ║
║  Bay 03 | Type-4 Shuttle                               ║
║  Credits: 125,000                                      ║
║                                                         ║
║  [ M ] MARKET      - Buy and sell goods                ║
║  [ I ] MISSIONS    - Available missions                ║
║  [ R ] REPAIR      - Hull: 85/100 HP (7,500 cr)        ║
║  [ F ] REFUEL      - Fuel: 650/1000 (17,500 cr)        ║
║  [ S ] SHIPYARD    - Purchase ships                    ║
║  [ N ] STATION INFO - View details                     ║
║  [ U ] UNDOCK      - Launch into space                 ║
║                                                         ║
║  [Press letter key to select]                          ║
╚════════════════════════════════════════════════════════╝
```

**Keyboard shortcuts:**
- Single letter keys for quick access
- ESC to go back
- ENTER to confirm
- Arrow keys for navigation (alternative)

### Market Interface

```
╔════════════════════════════════════════════════════════╗
║              EARTH STATION ALPHA - MARKET              ║
║                                                         ║
║  Your Credits: 125,000                                 ║
║  Your Cargo: 35 / 50 units                             ║
║                                                         ║
║  COMMODITY     │ BUY   │ SELL  │ STOCK │ TREND         ║
║ ───────────────┼───────┼───────┼───────┼─────────      ║
║  Water         │   55  │   50  │  85%  │  →            ║
║  Oxygen        │  105  │  100  │  90%  │  →            ║
║  Fuel          │   95  │   90  │  75%  │  ↓            ║
║  Electronics   │ 5200  │ 5000  │  45%  │  ↑            ║
║  Food          │  125  │  120  │  60%  │  →            ║
║                                                         ║
║  [↑↓] Select | [B] Buy | [S] Sell | [ESC] Back         ║
╚════════════════════════════════════════════════════════╝
```

**Interaction:**
- Arrow keys to select commodity
- B/S keys to buy/sell
- Enter quantity (numeric input)
- Confirm transaction

### Settings Menu

```
╔════════════════════════════════════════════════════════╗
║                      SETTINGS                          ║
║                                                         ║
║  GRAPHICS:                                             ║
║    Scanlines:          [ ON  ] OFF                     ║
║    CRT Glow:           [ ON  ] OFF                     ║
║    Framerate Limit:    [60] 120  144  UNLIMITED        ║
║                                                         ║
║  CONTROLS:                                             ║
║    Mouse Sensitivity:  [████████░░] 80%                ║
║    Invert Y-Axis:      ON  [ OFF ]                     ║
║    Keyboard Layout:    [WASD] ARROWS  CUSTOM           ║
║                                                         ║
║  AUDIO:                                                ║
║    Master Volume:      [██████████] 100%               ║
║    Music Volume:       [████░░░░░░]  40%               ║
║    SFX Volume:         [███████░░░]  70%               ║
║                                                         ║
║  [↑↓←→] Navigate | [ENTER] Confirm | [ESC] Back        ║
╚════════════════════════════════════════════════════════╝
```

---

## Notifications and Messages

### Toast Notifications

Temporary messages that appear and fade:

```
┌──────────────────────────────────────┐
│  ✓ Mission accepted                  │
└──────────────────────────────────────┘
```

**Duration:** 3-5 seconds
**Position:** Top-center or bottom-right
**Style:** Semi-transparent black background, cyan text

**Examples:**
- "Mission accepted"
- "Cargo purchased: 50 units of Water"
- "Hull repaired: +15 HP"
- "Docking clearance granted: Bay 03"

### Persistent Warnings

Warnings that stay until acknowledged or resolved:

```
┌──────────────────────────────────────┐
│  ⚠️ LOW FUEL WARNING                 │
│  Fuel below 10%. Refuel immediately. │
│  [Press SPACE to acknowledge]        │
└──────────────────────────────────────┘
```

**Position:** Center screen
**Style:** Red border, yellow text
**Blocks gameplay until acknowledged

---

## Accessibility Considerations

### Colorblind Support

**Problem:** Red/green warnings indistinguishable to some players

**Solution:**
- Use icons in addition to colors (✓ ⚠️ ❌)
- Offer colorblind-friendly palettes
- Shape coding (circles for OK, triangles for warning, X for critical)

**Example:**
```
REL VEL: 1.5 m/s ✓        (green + checkmark)
REL VEL: 3.5 m/s ⚠️        (yellow + warning)
REL VEL: 12.0 m/s ❌       (red + X)
```

### Font Scaling

**Option:** Allow UI scale adjustment (80%, 100%, 120%, 150%)
**Affected:** All text, bar sizes, menu layouts
**Preserves:** Aspect ratios and readability

### High Contrast Mode

**Option:** Increase contrast for visibility
- Black background → Pure black (#000000)
- Cyan text → Brighter cyan (#00FFFF → #AAFFFF)
- Remove subtle effects (scanlines, glow)

### Reduced Motion

**Option:** Disable animations
- No fade-in/fade-out
- Instant menu transitions
- No screen shake effects

---

## Implementation Notes

### HTML/CSS vs. Canvas

**Recommendation: HTML/CSS for UI, Canvas for HUD overlays**

**UI Menus (HTML/CSS):**
- Easier to layout and style
- Better accessibility (screen readers)
- Simpler text input
- Standard browser controls

**HUD Overlays (Canvas 2D):**
- Drawn on top of Three.js canvas
- Velocity, position, bars, crosshair
- Custom fonts and effects
- Frame-synchronized with game render

### Font Rendering

**Use web fonts:**
```css
@font-face {
  font-family: 'TerminalFont';
  src: url('/fonts/source-code-pro.woff2');
}

.hud-text {
  font-family: 'TerminalFont', 'Courier New', monospace;
  color: #00FFFF;
  text-shadow: 0 0 5px #00FFFF; /* Optional glow */
}
```

### Performance

**HUD updates:**
- Update only changed values (not entire HUD)
- Throttle non-critical updates (ETA every 1 second, not every frame)
- Use requestAnimationFrame for smooth rendering

**Canvas rendering:**
- Clear only dirty regions
- Batch text rendering
- Pre-render static elements

---

## Testing Checklist

- [ ] HUD is readable at 1080p, 1440p, 4K
- [ ] All critical info visible without scrolling
- [ ] Colorblind modes tested with simulations
- [ ] Font scaling works correctly
- [ ] Menus navigable with keyboard only
- [ ] HUD updates smoothly (no flicker)
- [ ] Docking alignment feedback is clear
- [ ] Notifications don't obscure critical info
- [ ] High contrast mode improves visibility

---

## Future Enhancements

### Phase 2+:
- Ship status page (detailed systems view)
- Star map overlay (navigate to stars)
- Mission log (track active missions)
- Statistics screen (distance traveled, dockings, profit)

### Phase 3+:
- Customizable HUD layout (drag and drop elements)
- Multiple HUD presets (minimal, standard, detailed)
- VR-compatible HUD (spatial UI)
- Voice commands (experimental)

---

## Conclusion

The HUD should be **invisible when working well**—players shouldn't think about it, just use it. Information should be:
- **Glanceable:** Read critical info in <1 second
- **Contextual:** Show only what's relevant now
- **Unobtrusive:** Don't block the game view
- **Functional:** No decoration for decoration's sake

The retro terminal aesthetic reinforces the "automated idiocrasy" theme—you're interfacing with ancient systems, not sleek modern UIs.

---

**Status:** Complete design. Ready for implementation in Phase 0 (basic HUD only).
