# Controls and Input System

**Version:** 0.1  
**Status:** Design Phase

---

## Overview

Open Frontier uses **keyboard and mouse** for all input in Phase 0, with gamepad support planned for Phase 2+. Controls should be **intuitive, responsive, and context-sensitive** (different controls when flying vs. docked).

This document covers:
- Default keybindings
- Mouse control scheme
- Context-sensitive controls
- Control customization
- Gamepad support (future)

---

## Design Philosophy

**Newtonian Physics Controls:**
- Thrust in direction ship is facing
- Rotation is independent of motion
- No "flight sim" assists or auto-leveling
- Player must think in vectors

**Context-Sensitive:**
- Different controls when flying vs. docked
- Menu navigation uses different keys
- Docking approach has additional bindings

**Customizable:**
- All keys rebindable (Phase 1+)
- Multiple preset schemes (WASD, Arrows, Dvorak)
- Mouse sensitivity adjustable

---

## Flight Controls (Primary Mode)

### Keyboard Layout (WASD + IJKL)

**Movement (WASD):**
- `W` - Thrust forward
- `A` - Thrust left
- `S` - Thrust backward
- `D` - Thrust right
- `SHIFT` - Thrust up
- `CTRL` - Thrust down

**Rotation (IJKL):**
- `I` - Pitch up
- `K` - Pitch down
- `J` - Yaw left
- `L` - Yaw right
- `U` - Roll left
- `O` - Roll right

**Alternative (Arrow Keys):**
- `↑` - Pitch up
- `↓` - Pitch down
- `←` - Yaw left
- `→` - Yaw right

**Thrust Control:**
- `Q` - Decrease thrust (10% increments)
- `E` - Increase thrust (10% increments)
- `Z` - Kill thrust (instant 0%)
- `X` - Full thrust (instant 100%)

**Tachyon Drive:**
- `[` - Decrease tachyon multiplier (tier down)
- `]` - Increase tachyon multiplier (tier up)
- `\` - Toggle autopilot (max multiplier)

**Camera:**
- `C` - Cycle camera mode (cockpit / drone external)
- `V` - Launch new camera drone (if destroyed)
- `MOUSE` - Look around (when holding right-click)

**Targeting:**
- `T` - Target nearest station
- `Y` - Target nearest planet
- `R` - Clear target

**UI:**
- `TAB` - Toggle extended HUD info
- `M` - Toggle map/navigation overlay (future)
- `ESC` - Pause menu / back

### Mouse Control

**Look/Rotate (Flight Mode):**
- Hold `RIGHT MOUSE` + move mouse → Rotate ship
- Cursor hidden while holding
- Release to stop rotating

**Sensitivity:**
- Adjustable in settings (50% - 200%)
- Separate X and Y sensitivity
- Invert Y-axis option

**Menu Navigation:**
- `LEFT MOUSE` - Click buttons
- `SCROLL WHEEL` - Scroll lists (market, missions)

---

## Docked Controls (Station Mode)

### Menu Navigation

**Keyboard:**
- `↑` / `↓` - Navigate menu items
- `ENTER` - Select / confirm
- `ESC` - Back / cancel
- **Letter keys** - Quick select (e.g., `M` for Market)

**Mouse:**
- `LEFT CLICK` - Select button
- `HOVER` - Highlight option
- `SCROLL` - Scroll long lists

### Station Menus

**Main Station Menu:**
- `M` - Market
- `I` - Missions
- `R` - Repair
- `F` - Refuel
- `S` - Shipyard
- `N` - Station Info
- `U` - Undock

**Market:**
- `↑` / `↓` - Select commodity
- `B` - Buy
- `S` - Sell
- `ENTER` - Confirm quantity
- `ESC` - Back to station menu

**Missions:**
- `↑` / `↓` - Browse missions
- `ENTER` - View details
- `A` - Accept mission
- `ESC` - Back

---

## Context-Sensitive Controls

### Flying in Open Space

**Active:**
- Movement (WASD + SHIFT/CTRL)
- Rotation (IJKL or arrows)
- Thrust control (Q/E/Z/X)
- Tachyon control ([/]/\)
- Camera (C/V)
- Targeting (T/Y/R)

**Inactive:**
- Menu shortcuts (M/I/R/F/S)
- Docking alignment controls

### Approaching Station (<10 km)

**Add:**
- `SPACE` - Request docking clearance (auto-assigned port)
- Docking alignment HUD active

**Keep:**
- All flight controls (manual approach required)

### Docked at Station

**Active:**
- Menu navigation (arrow keys, ENTER, ESC)
- Quick menu access (M/I/R/F/S/N/U)

**Inactive:**
- Flight controls (ship is docked)
- Camera controls
- Targeting

---

## Advanced Controls

### Velocity Matching (Docking Aid)

**`SPACE` (near station):**
- Automatically match velocity with target station
- Reduces relative velocity to near-zero
- Does NOT align or dock automatically
- Useful for beginners

**Implementation:**
```typescript
function matchVelocity(ship: Ship, target: Station): void {
  const targetVelocity = target.velocity;
  const deltaV = targetVelocity.sub(ship.velocity);
  
  // Apply thrust to match velocity over 2-3 seconds
  const matchRate = 0.5; // Adjust for feel
  ship.velocity.add(deltaV.multiplyScalar(matchRate * dt));
}
```

### Autopilot (Future Phase 2+)

**`P` - Toggle autopilot:**
- Flies ship automatically to selected target
- Uses optimal thrust and tachyon multiplier
- Alerts player when approaching destination
- Can be canceled anytime

**Safety:**
- Disengages if collision imminent
- Disengages if damaged
- Requires player to manually dock

---

## Control Customization

### Rebindable Keys (Phase 1+)

**All keys rebindable except:**
- `ESC` (pause/back is universal)
- `ENTER` (confirm is universal)

**Conflict detection:**
- Warn if two actions share same key
- Suggest alternatives
- Reset to defaults option

### Presets

**WASD (Default):**
- Movement: WASD + SHIFT/CTRL
- Rotation: IJKL

**Arrow Keys:**
- Movement: Arrow keys + SHIFT/CTRL
- Rotation: Numpad 8/5/4/6

**Dvorak:**
- Movement: ,AOE + SHIFT/CTRL
- Rotation: CHTN

**Custom:**
- Player defines all keys

---

## Gamepad Support (Phase 2+)

### Xbox/PlayStation Layout

**Left Stick:**
- Thrust forward/back/left/right
- Analog control (proportional thrust)

**Right Stick:**
- Pitch and yaw
- Analog control

**Triggers:**
- `LT` - Thrust down
- `RT` - Thrust up

**Bumpers:**
- `LB` - Roll left
- `RB` - Roll right

**Face Buttons:**
- `A` / `X` - Confirm / select
- `B` / `Circle` - Cancel / back
- `X` / `Square` - Target nearest
- `Y` / `Triangle` - Cycle camera

**D-Pad:**
- Up/Down - Tachyon multiplier
- Left/Right - Thrust level

**Special:**
- `START` - Pause menu
- `BACK` / `SELECT` - Extended HUD

**Haptic Feedback:**
- Light rumble on thrust
- Heavy rumble on collision
- Pulse on docking success

---

## Mouse Sensitivity

### Settings

**Mouse Sensitivity:**
- Range: 50% - 200%
- Default: 100%
- Separate X and Y sensitivity
- Linear response (no acceleration)

**Invert Y-Axis:**
- OFF (default): Move mouse up → pitch up
- ON: Move mouse up → pitch down (flight sim style)

**Mouse Smoothing:**
- OFF (recommended): Direct input
- ON: Slight smoothing for smoother camera

---

## Input Handling Implementation

### Input Manager

```typescript
class InputManager {
  private keys: Set<string> = new Set();
  private mousePos: Vector2 = new Vector2();
  private mouseDelta: Vector2 = new Vector2();
  private mouseButtons: Set<number> = new Set();
  
  constructor() {
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    
    window.addEventListener('mousemove', (e) => {
      this.mouseDelta.set(e.movementX, e.movementY);
      this.mousePos.set(e.clientX, e.clientY);
    });
    
    window.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
    });
    
    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
    });
  }
  
  isKeyPressed(code: string): boolean {
    return this.keys.has(code);
  }
  
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }
  
  getMouseDelta(): Vector2 {
    const delta = this.mouseDelta.clone();
    this.mouseDelta.set(0, 0); // Reset after read
    return delta;
  }
}
```

### Ship Control from Input

```typescript
function updateShipControlsFromInput(ship: Ship, input: InputManager, dt: number): void {
  // Thrust
  const thrustVector = new Vector3();
  
  if (input.isKeyPressed('KeyW')) thrustVector.z -= 1;
  if (input.isKeyPressed('KeyS')) thrustVector.z += 1;
  if (input.isKeyPressed('KeyA')) thrustVector.x -= 1;
  if (input.isKeyPressed('KeyD')) thrustVector.x += 1;
  if (input.isKeyPressed('ShiftLeft')) thrustVector.y += 1;
  if (input.isKeyPressed('ControlLeft')) thrustVector.y -= 1;
  
  // Normalize and apply
  if (thrustVector.length() > 0) {
    thrustVector.normalize();
    ship.applyThrust(thrustVector, dt);
  }
  
  // Rotation (mouse)
  if (input.isMouseButtonPressed(2)) { // Right mouse button
    const mouseDelta = input.getMouseDelta();
    const sensitivity = settings.mouseSensitivity / 100;
    
    ship.rotate(
      -mouseDelta.y * sensitivity * dt, // Pitch
      -mouseDelta.x * sensitivity * dt, // Yaw
      0 // Roll
    );
  }
  
  // Rotation (keyboard)
  if (input.isKeyPressed('KeyI')) ship.rotate(1 * dt, 0, 0);
  if (input.isKeyPressed('KeyK')) ship.rotate(-1 * dt, 0, 0);
  if (input.isKeyPressed('KeyJ')) ship.rotate(0, 1 * dt, 0);
  if (input.isKeyPressed('KeyL')) ship.rotate(0, -1 * dt, 0);
  if (input.isKeyPressed('KeyU')) ship.rotate(0, 0, 1 * dt);
  if (input.isKeyPressed('KeyO')) ship.rotate(0, 0, -1 * dt);
}
```

---

## On-Screen Control Help

### Quick Reference (Toggle with F1)

```
╔════════════════════════════════════════════════════════╗
║                    CONTROLS                            ║
╠════════════════════════════════════════════════════════╣
║  MOVEMENT                                              ║
║    W/A/S/D       - Thrust forward/left/back/right      ║
║    SHIFT/CTRL    - Thrust up/down                      ║
║    Q/E           - Decrease/increase thrust            ║
║    Z/X           - Kill/full thrust                    ║
║                                                         ║
║  ROTATION                                              ║
║    MOUSE + RMB   - Look around / rotate ship           ║
║    I/K           - Pitch up/down                       ║
║    J/L           - Yaw left/right                      ║
║    U/O           - Roll left/right                     ║
║                                                         ║
║  TACHYON DRIVE                                         ║
║    [ / ]         - Decrease/increase multiplier        ║
║    \             - Toggle autopilot (max speed)        ║
║                                                         ║
║  CAMERA                                                ║
║    C             - Cycle camera mode                   ║
║    V             - Launch new camera drone             ║
║                                                         ║
║  TARGETING                                             ║
║    T             - Target nearest station              ║
║    Y             - Target nearest planet               ║
║    R             - Clear target                        ║
║                                                         ║
║  OTHER                                                 ║
║    TAB           - Toggle extended HUD                 ║
║    ESC           - Pause menu                          ║
║    F1            - Toggle this help                    ║
╚════════════════════════════════════════════════════════╝
```

---

## Accessibility Features

### Alternative Input Methods

**Single-Hand Mode (Phase 2+):**
- All controls accessible with one hand
- Left-hand or right-hand variants
- Useful for players with disabilities

**Sticky Keys:**
- Hold modifier keys (SHIFT, CTRL) without holding
- Toggle on/off with multiple presses
- Accessibility standard

**Key Repeat:**
- Adjustable key repeat delay
- Adjustable key repeat rate
- Prevent accidental inputs

---

## Tutorial / First Launch

### Control Introduction

**First time playing:**
1. Brief overlay: "Use WASD to thrust, mouse to look"
2. Prompt to thrust forward: "Press W to move"
3. Prompt to rotate: "Hold Right Mouse Button and move to rotate"
4. Prompt to target: "Press T to target the station"
5. Proceed to free flight

**Optional full tutorial:**
- Practice thrust control
- Practice rotation
- Practice matching velocity
- Practice docking
- Unlock full game after completion

---

## Performance Considerations

### Input Polling

**Every frame (60 Hz):**
- Check key states
- Read mouse position/delta
- Update ship controls

**Cost:** <0.01ms per frame (negligible)

### Input Lag

**Goal:** <16ms (1 frame at 60fps)
**Achieve:**
- Poll input at start of frame
- Apply immediately to ship state
- Render result same frame

**Test:** Visual feedback should feel instant

---

## Testing Checklist

- [ ] All keys respond correctly
- [ ] Mouse rotation feels smooth
- [ ] No input lag (<16ms)
- [ ] Controls work with different keyboard layouts
- [ ] Rebinding works correctly
- [ ] Gamepad support functional (Phase 2+)
- [ ] Accessibility features work
- [ ] Context switching (flight vs. docked) works
- [ ] On-screen help is accurate

---

## Future Enhancements

### Phase 2+:
- Gamepad support (Xbox, PlayStation, generic)
- Custom control profiles (save/load)
- Control hints (show key for action on hover)
- Voice commands (experimental)
- Motion controls (VR, future)

### Phase 3+:
- Multi-input support (keyboard + gamepad simultaneously)
- Macro system (record input sequences)
- Adaptive difficulty (adjust controls based on skill)

---

## Conclusion

Controls should be:
- **Responsive:** No lag, instant feedback
- **Intuitive:** Easy to learn, hard to master
- **Flexible:** Rebindable, multiple schemes
- **Accessible:** Options for all players

The Newtonian physics model means controls are **intentionally challenging**—you can't just point and go. You have to think about vectors, rotation, and momentum. This is a feature, not a bug.

**The best control scheme is invisible:** Players stop thinking about which key to press and just *fly*.

---

**Status:** Complete design. Ready for implementation in Phase 0 (keyboard + mouse only).
