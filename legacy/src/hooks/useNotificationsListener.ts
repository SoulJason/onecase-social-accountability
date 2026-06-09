import { useEffect } from 'react';
import { useQueryClient } from 'react-query';
import supabase from '../lib/supabase';
import { Notification } from '../types';
import toCamelCase from '../utils/toCamelCase';

export default function useNotificationsListener() {
  const queryClient = useQueryClient();
  const user = supabase.auth.user();

  useEffect(() => {
    const notificationsSubscription = supabase
      .from(`notifications:receiver_id=eq.${user?.id}`)
      .on('INSERT', (payload) => {
        queryClient.setQueryData(
          'notifications',
          (oldData: Notification[] | undefined) => {
            if (oldData) {
              if (
                oldData.some((notificaton) => notificaton.id === payload.new.id)
              ) {
                return toCamelCase(oldData);
              }
              return toCamelCase(oldData.concat(payload.new));
            } else {
              return toCamelCase([payload.new]);
            }
          }
        );
        queryClient.setQueryData(
          'notificationCount',
          (oldData: number | undefined) => {
            if (oldData && oldData !== 0) {
              return oldData + 1;
            } else {
              return 1;
            }
          }
        );
      })
      // .on('DELETE', (payload) => {
      //   queryClient.setQueryData(
      //     'notifications',
      //     (oldData: Notification[] | undefined) => {
      //       if (oldData) {
      //         return toCamelCase(
      //           oldData.filter(
      //             (notification) => notification.id !== payload.new.id
      //           )
      //         );
      //       } else {
      //         return toCamelCase([]);
      //       }
      //     }
      //   );
      //   queryClient.setQueryData(
      //     'notificationCount',
      //     (oldData: number | undefined) => {
      //       if (oldData && oldData !== 0) {
      //         return oldData - 1;
      //       } else {
      //         return 0;
      //       }
      //     }
      //   );
      // })
      .subscribe();

    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, []);
}
