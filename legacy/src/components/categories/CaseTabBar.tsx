import React from 'react';
import { Animated, View, Text, Pressable } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Case } from '../../types';

function CaseTabBar({ cases, state, descriptors, navigation, position }: any) {
  const routes = [...state.routes];

  const colors = cases?.map((caseItem: Case) => caseItem.color);
  const emojis = cases?.map((caseItem: Case) => caseItem.emoji);

  while (routes.length < 4) {
    routes.push({
      key: routes.length - 1,
      name: 'Undecided',
      params: undefined,
    });
  }
  const firstUnoccupiedIndex = routes.findIndex(
    (route: any) => route.name === 'Undecided'
  );
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ width: '100%', backgroundColor: '#5F605F' }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginHorizontal: 20,
          }}
        >
          {routes.map((route: any, index: number) => {
            if (route.name !== 'Undecided') {
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
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 5,
                    backgroundColor: isFocused ? colors[index] : 'transparent',
                  }}
                >
                  <Animated.Text
                    style={[
                      isFocused ? styles.active : styles.inactive,
                      {
                        fontSize: 32,
                      },
                    ]}
                  >
                    {emojis[index]}
                  </Animated.Text>
                </Pressable>
              );
            } else {
              const onPress = () => {
                navigation.navigate('CreateCase', {
                  index: firstUnoccupiedIndex,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole='button'
                  onPress={onPress}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                  }}
                >
                  <Text>⬛</Text>
                </Pressable>
              );
            }
          })}
        </View>
      </View>
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
    fontSize: '$body',
    fontFamily: '$boldFont',
    color: '$blueberry',
  },
  inactive: {
    fontSize: '$body',
    fontFamily: '$boldFont',
    color: '#BCBCBC',
  },
});
export default CaseTabBar;
