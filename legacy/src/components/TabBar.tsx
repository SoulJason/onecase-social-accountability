import React from 'react';
import { Animated, View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Timer from '../assets/images/timer.svg';

function TabBar({ state, descriptors, navigation, position }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole='button'
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1, alignItems: 'center', padding: 10 }}
          >
            <Animated.Text style={isFocused ? styles.active : styles.inactive}>
              {label}
            </Animated.Text>
            {isFocused ? (
              <View
                style={{
                  height: 5,
                  width: '20%',
                  borderRadius: 10,
                  backgroundColor: 'black',
                }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = EStyleSheet.create({
  welcome: {
    fontFamily: '$boldFont',
    fontSize: 18,
    color: '#2B2B2B',
    textAlign: 'center',
  },
  active: {
    fontSize: 20,
    fontFamily: '$boldFont',
    color: '$blueberry',
  },
  inactive: {
    fontSize: 20,
    fontFamily: '$boldFont',
    color: '#BCBCBC',
  },
  thisWeek: {
    fontFamily: '$boldFont',
    color: '#5F605F',
    fontSize: '$body',
  },
  timerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 15,
    fontFamily: '$boldFont',
    color: 'white',
  },
});
export default TabBar;
