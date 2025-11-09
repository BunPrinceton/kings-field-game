# Door Transition System Integration Guide

This guide explains how to integrate the Resident Evil style door transition system into your King's Field game.

## Files Created

1. **DoorTransition.js** - Core door animation system
   - Creates first-person door opening animations
   - Supports multiple door types (wooden, iron, ornate, reinforced)
   - Handles camera movement and fade effects
   - Manages sound playback

2. **DoorTransitionIntegration.js** - Integration helper
   - Connects door system to main game
   - Handles furniture interaction
   - Provides UI prompts
   - Manages input blocking during transitions

3. **Updated FurnitureManager.js**
   - Added `isInstanceDoor` flag support
   - Added `instanceTarget` property for doors
   - Created `addInstanceDoorIndicator()` for visual markers
   - Updated `interact()` method to return detailed results

4. **Updated SoundConfig.js**
   - Added 12 new door transition sounds
   - Handle turn sounds (wood, metal, ornate)
   - Door creak sounds (wood, metal, ornate)
   - Door open sounds (wood, heavy, grand)
   - Footstep sounds (normal, slow, confident)

## Integration Steps

### 1. Import the Integration Helper in main.js

Add this import at the top of `src/main.js`:

```javascript
import { DoorTransitionIntegration } from './DoorTransitionIntegration.js';
```

### 2. Add to Game State

In the `game` object, add a new property:

```javascript
const game = {
    // ... existing properties ...
    doorTransition: null, // DoorTransitionIntegration instance
};
```

### 3. Initialize in init() Function

After furniture system initialization (around line 920 in main.js), add:

```javascript
// Initialize door transition system
if (game.dungeon.furniture) {
    game.doorTransition = new DoorTransitionIntegration(game);
    console.log('Door transition system initialized');

    // Optional: Add test instance doors for demonstration
    game.doorTransition.addTestInstanceDoors();
}
```

### 4. Update the tryInteractWithFurniture() Function

Replace the existing `tryInteractWithFurniture()` function with:

```javascript
function tryInteractWithFurniture() {
    if (!game.doorTransition) return;

    // Check if transition is playing
    if (game.doorTransition.isInputBlocked()) {
        console.log('Input blocked during transition');
        return;
    }

    // Try to interact
    const result = game.doorTransition.tryInteractWithNearbyFurniture();

    if (result) {
        console.log('Furniture interaction:', result.type);
    }
}
```

### 5. Block Input During Transitions

In the `updateMovement()` function, add a check at the beginning:

```javascript
function updateMovement(deltaTime) {
    // Block movement during door transitions
    if (game.doorTransition && game.doorTransition.isInputBlocked()) {
        game.movement.velocity.x = 0;
        game.movement.velocity.z = 0;
        return;
    }

    // ... rest of movement code ...
}
```

### 6. Update UI with Interaction Prompts

In the `animate()` or update loop, add:

```javascript
function animate() {
    // ... existing code ...

    // Update interaction UI
    if (game.doorTransition) {
        game.doorTransition.updateInteractionUI();
    }

    // ... rest of animate code ...
}
```

### 7. Block Attack During Transitions

In the attack handling code (around the Space key handler), add:

```javascript
// In the update/animate loop where attacks are processed
if (game.input.attack && !game.player.isAttacking) {
    // Block attack during door transitions
    if (game.doorTransition && game.doorTransition.isInputBlocked()) {
        return;
    }

    // ... existing attack code ...
}
```

## Creating Instance Doors

### Programmatically

```javascript
// Get furniture manager
const furnitureManager = game.dungeon.furniture.getFurnitureManager();

// Create an instance door
const instanceDoor = furnitureManager.createFurniture(
    FurnitureType.ORNATE_DOOR,  // Door type
    { x: 10, y: 0, z: 10 },     // Position
    {
        rotation: Math.PI / 2,   // Rotation
        interactable: true,      // Make it interactable
        isInstanceDoor: true,    // Mark as instance portal
        instanceTarget: 'boss_room_1'  // Target instance ID
    }
);
```

### In FurnitureDecorator

Modify room decoration functions to add instance doors:

```javascript
decorateBossRoom(room) {
    const center = this.getRoomCenter(room);

    // Add instance door to boss room
    this.placeFurniture(
        FurnitureType.ORNATE_DOOR,
        center.x,
        center.z - 3,
        Math.PI,
        {
            condition: FurnitureCondition.PRISTINE,
            interactable: true,
            isInstanceDoor: true,
            instanceTarget: 'boss_arena'
        }
    );

    // ... rest of boss room decoration ...
}
```

## Door Types and Their Animations

### Wooden Door
- **Handle Turn**: 400ms, quarter turn
- **Door Swing**: 1200ms, creaky
- **Camera Move**: 800ms
- **Style**: Cautious, slower

### Iron Door
- **Handle Turn**: 600ms, shallow turn (heavy)
- **Door Swing**: 1600ms, very slow
- **Camera Move**: 1000ms
- **Style**: Heavy, mechanical

### Ornate Door
- **Handle Turn**: 500ms, large turn
- **Door Swing**: 1400ms, smooth
- **Camera Move**: 900ms
- **Style**: Grand, confident

### Reinforced Door
- **Handle Turn**: 700ms, very shallow
- **Door Swing**: 1800ms, slowest
- **Camera Move**: 1100ms
- **Style**: Extremely heavy

## Visual Indicators

Instance doors are marked with:
- Cyan glowing orb above the door
- Pulsing light effect
- Point light for atmospheric glow
- Different UI prompt: "Press E to Enter" vs "Press E to Open"

## Sound Implementation

The system expects these sound files in `public/sounds/environment/`:

1. `door_handle_wood.ogg` - Wooden handle turn
2. `door_handle_metal.ogg` - Metal handle turn
3. `door_handle_ornate.ogg` - Ornate handle turn
4. `door_creak_wood.ogg` - Wooden door creak
5. `door_creak_metal.ogg` - Metal door creak
6. `door_creak_ornate.ogg` - Ornate door creak
7. `door_open_wood.ogg` - Wood door fully open
8. `door_open_heavy.ogg` - Heavy door open
9. `door_open_grand.ogg` - Grand door open
10. `door_footstep.ogg` - Normal footstep through door
11. `door_footstep_slow.ogg` - Slow/cautious footstep
12. `door_footstep_confident.ogg` - Confident footstep

If sounds are missing, the system will continue to work but without audio.

## Instance Loading Hook

The door transition system provides a callback during the fade-to-black phase. This is where you should implement instance loading:

```javascript
// In DoorTransitionIntegration.js, handleInstanceDoorInteraction method:
this.doorTransition.playTransition(
    interactionResult.furnitureObject,
    interactionResult.doorType,
    () => {
        // Called during fade to black
        console.log('Loading instance:', interactionResult.instanceTarget);

        // YOUR INSTANCE LOADING CODE HERE
        // Examples:
        // - Load new dungeon section
        // - Spawn boss arena
        // - Enter safe room
        // - Transition between levels

        // Current placeholder: teleport player forward
        this.teleportPlayerThroughDoor();
    }
);
```

## Testing

1. Run the game
2. Look for cyan glowing orbs (instance doors)
3. Approach a door (within 2.5 units)
4. Press 'E' to trigger transition
5. Watch the animation sequence:
   - Handle turns
   - Door swings open
   - Camera moves forward
   - Fade to black
   - (Instance loads)
   - Fade from black
   - Player teleported through door

## Customization

### Animation Timing

Edit `getDoorConfig()` in `DoorTransition.js` to adjust:
- `handleTurnDuration` - Handle rotation speed
- `doorSwingDuration` - Door opening speed
- `cameraMoveDuration` - Camera movement speed
- `handleTurnAngle` - How far handle rotates
- `doorSwingAngle` - How wide door opens
- `cameraForwardDistance` - How far camera moves

### Visual Style

Edit `createDoorAnimationObjects()` and `addDoorDetails()` in `DoorTransition.js` to modify:
- Door size and proportions
- Material properties
- Decorative elements
- Handle design

### Instance Door Appearance

Edit `addInstanceDoorIndicator()` in `FurnitureManager.js` to change:
- Glow color (currently cyan: 0x00ffff)
- Pulse speed and intensity
- Light properties
- Indicator position

## Performance Notes

- Door animation objects are created on-demand and cleaned up after use
- Only one transition can play at a time
- Input is blocked during transitions to prevent issues
- Geometries and materials are properly disposed

## Future Enhancements

Potential additions:
1. Different door opening directions (left/right swing)
2. Sliding doors (sci-fi style)
3. Double doors (both panels opening)
4. Door unlock animations (key/lockpick)
5. Failed interaction (locked door rattle)
6. Two-way transitions (door from both sides)
7. Save door state across instances
8. Particle effects (dust, light rays)
9. More complex camera paths
10. Instance preloading during animation

## Troubleshooting

**Doors don't have glow effect:**
- Check that `isInstanceDoor: true` is set
- Verify `addInstanceDoorIndicator()` is being called

**No sound during transition:**
- Check AudioManager is initialized
- Verify sound files exist (or remove sound calls for silent mode)
- Check browser console for audio errors

**Input not blocked:**
- Verify `isInputBlocked()` checks are in place
- Check that movement and attack are blocked during transitions

**Transition not triggering:**
- Check door is within interaction range (2.5 units)
- Verify 'E' key handler is calling `tryInteractWithFurniture()`
- Check console for interaction logs

**Player falls through floor after transition:**
- Ensure collision detection is working
- Check player Y position is maintained
- Verify new instance has proper collision

## Complete Example

See `DoorTransitionIntegration.js` `addTestInstanceDoors()` method for a complete working example of adding instance doors to a generated dungeon.
