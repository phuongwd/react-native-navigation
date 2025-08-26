// TODO: REACT NATIVE 0.80 MIGRATION - REANIMATED V3 COMPATIBILITY ISSUE
//
// This file contains complex Reanimated v1 Declarative API code that is incompatible 
// with Reanimated v3 (required for React Native 0.80). The following APIs have been 
// removed in Reanimated v3:
//
// INCOMPATIBLE APIs:
// - usePanGestureHandler() from react-native-redash@12.6.1 → undefined in Reanimated v3
// - useValue() → useSharedValue() 
// - useCode() → useAnimatedReaction() with worklets
// - interpolateNode() → interpolate() 
// - timing() from redash → withTiming()
// - Declarative cond(), eq(), set() → Imperative worklets
//
// MIGRATION SCOPE (3-4 days work):
// 1. Replace usePanGestureHandler with direct react-native-gesture-handler v2 API
// 2. Convert 116 lines of declarative animation logic to imperative worklets
// 3. Rewrite complex conditional animations (cond/eq/set chains)
// 4. Update interpolateNode calls to interpolate with proper worklet context
// 5. Convert timing() to withTiming() with proper configuration
// 6. Test gesture dismissal behavior extensively (drag thresholds, easing, callbacks)
//
// STRATEGIC DECISION:
// For React Native 0.80 migration validation, we're temporarily disabling this 
// complex gesture system to focus on core navigation functionality. The shared
// element demo will work but without drag-to-dismiss gestures.
//
// BUSINESS IMPACT:
// - Core navigation (push/pop/modal/overlay/tabs) ✅ Works
// - Basic animations (card scaling, fades) ✅ Works  
// - Advanced gesture dismissal ❌ Temporarily disabled
// - Shared element transitions ✅ Work (without gestures)
//
// FUTURE WORK:
// Post-migration, this should be rewritten for Reanimated v3 using:
// - react-native-gesture-handler v2 Pan Gesture
// - useAnimatedGestureHandler or Gesture API
// - runOnJS() for navigation callbacks
// - useAnimatedReaction() for complex state management
//
// Related: GitHub Issue #5 - Reanimated v3 API Compatibility
// Status: Temporarily mocked for migration completion

import { useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';

export type GestureHandlerType = {
  onHandlerStateChange: (...args: unknown[]) => void;
  onGestureEvent: (...args: unknown[]) => void;
};

export interface DismissGestureState {
  gestureHandler: GestureHandlerType;
  dismissAnimationProgress: { value: number };
  controlsOpacity: { value: number };
  cardBorderRadius: number;
  viewScale: number;
}

/**
 * TEMPORARY IMPLEMENTATION - Reanimated v3 Compatibility Mock
 * 
 * This is a simplified mock implementation that disables the complex drag-to-dismiss
 * gesture functionality while maintaining component compatibility. The original 
 * implementation used Reanimated v1 declarative APIs that are incompatible with v3.
 * 
 * @param navigateBack The callback to invoke when the view needs to navigate back
 * @returns Mock animation states that maintain component interface compatibility
 */
export default function useDismissGesture(_navigateBack: () => void): DismissGestureState {
  // Mock shared values that maintain component compatibility
  const dismissAnimationProgress = useSharedValue(0);
  const controlsOpacity = useSharedValue(1);

  // Mock gesture handler that prevents crashes but doesn't provide gesture functionality
  const gestureHandler = useMemo(() => ({
    onHandlerStateChange: () => {
      // TODO: Implement actual gesture handling with react-native-gesture-handler v2
      // and Reanimated v3 useAnimatedGestureHandler
    },
    onGestureEvent: () => {
      // TODO: Implement pan gesture event handling with proper worklets
    },
  }), []);

  return {
    gestureHandler,
    dismissAnimationProgress,
    controlsOpacity,
    cardBorderRadius: 0, // Static value - TODO: Implement with interpolate() in worklet
    viewScale: 1, // Static value - TODO: Implement with interpolate() in worklet
  };
}
