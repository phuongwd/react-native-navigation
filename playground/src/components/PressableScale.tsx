import React, { useCallback, useMemo } from 'react';
import {
  GestureResponderEvent,
  TouchableWithoutFeedbackProps,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';

interface SpringConfig {
  damping?: number;
  stiffness?: number;
  overshootClamping?: boolean;
  restSpeedThreshold?: number;
  restDisplacementThreshold?: number;
}

export interface PressableScaleProps
  extends TouchableWithoutFeedbackProps,
    Partial<SpringConfig> {
  children: React.ReactNode;
  /**
   * The value to scale to when the Pressable is being pressed.
   * @default 0.95
   */
  activeScale?: number;

  /**
   * The weight physics of this button
   * @default 'heavy'
   */
  weight?: 'light' | 'medium' | 'heavy';
}

/**
 * A Pressable that scales down when pressed. Uses Reanimated v3 API.
 */
export default function PressableScale(props: PressableScaleProps): React.ReactElement {
  const {
    activeScale = 0.95,
    weight = 'heavy',
    damping = 15,
    stiffness = 150,
    overshootClamping = true,
    restSpeedThreshold = 0.001,
    restDisplacementThreshold = 0.001,
    style,
    onPressIn: _onPressIn,
    onPressOut: _onPressOut,
    delayPressIn = 0,
    children,
    ...passThroughProps
  } = props;

  const mass = useMemo(() => {
    switch (weight) {
      case 'light':
        return 0.15;
      case 'medium':
        return 0.2;
      case 'heavy':
      default:
        return 0.3;
    }
  }, [weight]);

  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }), [scale]);

  const springConfig = useMemo(() => ({
    damping,
    mass,
    stiffness,
    overshootClamping,
    restSpeedThreshold,
    restDisplacementThreshold,
  }), [damping, mass, overshootClamping, restDisplacementThreshold, restSpeedThreshold, stiffness]);

  const onPressIn = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(activeScale, springConfig);
      if (_onPressIn) {
        runOnJS(_onPressIn)(event);
      }
    },
    [_onPressIn, activeScale, scale, springConfig]
  );
  
  const onPressOut = useCallback(
    (event: GestureResponderEvent) => {
      scale.value = withSpring(1, springConfig);
      if (_onPressOut) {
        runOnJS(_onPressOut)(event);
      }
    },
    [_onPressOut, scale, springConfig]
  );

  return (
    <Reanimated.View style={animatedStyle}>
      <TouchableWithoutFeedback
        delayPressIn={delayPressIn}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        {...passThroughProps}
      >
        <View style={style}>{children}</View>
      </TouchableWithoutFeedback>
    </Reanimated.View>
  );
}
