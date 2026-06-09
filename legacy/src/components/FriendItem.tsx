import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { View, Text, Pressable } from 'react-native';
import { Avatar } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import { User } from '../types';
import IconButton from './IconButton';
import useAddUserRelationship from '../mutations/useAddUserRelationship';
import { sendPushNotification } from '../lib/supabase/store';
import { useUser } from '../providers/UserContext';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import Button from './Button';
import { useMixpanel } from '../providers/MixpanelContext';

interface Props {
  item: User;
  onPress?: () => void;
  actionButton?: boolean;
  noPressHighlight?: boolean;
}

const FriendItem = ({
  item,
  onPress,
  actionButton,
  noPressHighlight,
}: Props) => {
  const { user } = useUser();
  const addUserRelationshipMutation = useAddUserRelationship();
  const mixpanel = useMixpanel();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => [1, '40%'], []);

  // callbacks
  const showBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.present();
    }
  }, []);
  const dismissBottomSheet = useCallback(() => {
    if (bottomSheetModalRef.current) {
      bottomSheetModalRef.current.dismiss();
    }
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    if (index === 0) {
      dismissBottomSheet();
    }
  }, []);

  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} appearsOnIndex={1} />,
    []
  );

  const ActionButton = () => {
    switch (item.relationshipStatus) {
      case 'friends': {
        return (
          <IconButton
            type='primary'
            icon={<Ionicons name='ios-checkmark' size={24} color='white' />}
            onPress={() => {
              showBottomSheet();
            }}
          >
            Friends
          </IconButton>
        );
      }
      case 'received': {
        return (
          <IconButton
            type='primary'
            icon={<Ionicons name='person-add-sharp' size={24} color='white' />}
            onPress={() => {
              mixpanel?.track('Accepted friend', {
                Adder: item.id,
                Added: user?.id,
              });
              addUserRelationshipMutation.mutate({
                userId: item.id,
                status: 'friends',
              });
            }}
          >
            Accept
          </IconButton>
        );
      }
      case 'sent': {
        return (
          <IconButton
            type='light'
            icon={<Ionicons name='person-add-sharp' size={24} color='black' />}
            onPress={() => {
              addUserRelationshipMutation.mutate({
                userId: item.id,
                status: 'cancel',
              });
            }}
          >
            Added
          </IconButton>
        );
      }
      default: {
        return (
          <IconButton
            type='primary'
            icon={<Ionicons name='person-add-sharp' size={24} color='white' />}
            onPress={async () => {
              mixpanel?.track('Added friend', {
                Adder: user?.id,
                Added: item.id,
              });
              await addUserRelationshipMutation.mutate({
                userId: item.id,
                status: 'pending',
              });
              await sendPushNotification(
                item.pushToken ?? '',
                item.id,
                'add_friend',
                'Friend Request',
                `${user?.firstName} added you as a friend.`
              );
            }}
          >
            Add
          </IconButton>
        );
      }
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => {
        if (noPressHighlight) {
          return styles.item;
        }
        return [
          styles.item,
          {
            opacity: pressed ? 0.4 : 1.0,
          },
        ];
      }}
    >
      <View style={styles.userInfo}>
        <Avatar
          size='medium'
          rounded
          source={{ uri: item.avatarUrl }}
          icon={{
            name: 'user-circle',
            type: 'font-awesome',
            color: 'black',
          }}
          // avatarStyle={{ width: 100, height: 100 }}
          activeOpacity={0.7}
        >
          {item.selected && (
            <View style={styles.checkmarkIcon}>
              <Ionicons
                name='checkmark-circle-outline'
                size={24}
                color='white'
              />
              <Ionicons
                name='checkmark-circle'
                size={24}
                color='#7189FF'
                style={styles.checkmark}
              />
            </View>
          )}
        </Avatar>
        <View style={styles.text}>
          <Text style={styles.nameText}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.usernameText}>{item.username}</Text>
        </View>
      </View>

      <View>{actionButton ? <ActionButton /> : null}</View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onChange={handleSheetChanges}
      >
        <View style={{ alignItems: 'center' }}>
          <Avatar
            size='medium'
            rounded
            source={{ uri: item.avatarUrl }}
            icon={{
              name: 'user-circle',
              type: 'font-awesome',
              color: 'black',
            }}
            activeOpacity={0.7}
          >
            {item.selected && (
              <View style={styles.checkmarkIcon}>
                <Ionicons
                  name='checkmark-circle-outline'
                  size={24}
                  color='white'
                />
                <Ionicons
                  name='checkmark-circle'
                  size={24}
                  color='#7189FF'
                  style={styles.checkmark}
                />
              </View>
            )}
          </Avatar>
        </View>
        <View style={styles.text}>
          <Text style={styles.nameText}>
            Are you sure you want to remove {item.firstName} {item.lastName} (@
            {item.username})?
          </Text>
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
            marginHorizontal: 10,
          }}
        >
          <Button
            type='danger'
            onPress={() => {
              addUserRelationshipMutation.mutate({
                userId: item.id,
                status: 'cancel',
              });
              dismissBottomSheet();
            }}
          >
            Confirm
          </Button>
          <Button
            type='light'
            onPress={dismissBottomSheet}
            style={{ marginTop: 20 }}
          >
            Cancel
          </Button>
        </View>
      </BottomSheetModal>
    </Pressable>
  );
};

const styles = EStyleSheet.create({
  item: {
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    padding: 5,
  },
  text: {
    marginLeft: 10,
  },
  nameText: {
    color: '#323232',
    fontFamily: '$boldFont',
    fontSize: 16,
  },
  usernameText: {
    color: '#9E9E9E',
  },
  checkmarkIcon: {
    position: 'absolute',
    top: -3,
    right: -5,
  },
  checkmark: {
    top: 0,
    left: 0,
    position: 'absolute',
    borderRadius: 9999,
  },
});

export default FriendItem;
