import supabase from '.';
import _, { first } from 'lodash';
import produce from 'immer';
import { Case, NotificationType, User } from '../../types';
import { IState } from '../../screens/create-account/store/StateProvider';
import { sanitizeUsername } from '../../helpers/sanitizeUsername';
import { decode } from 'base64-arraybuffer';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useQueryClient } from 'react-query';

const toCamelCase: any = (data: any) => {
  if (!_.isObject(data)) {
    return data;
  } else if (_.isArray(data)) {
    return data.map((v) => toCamelCase(v));
  }
  return _.reduce(
    data,
    (r, v, k) => {
      return {
        ...r,
        [_.camelCase(k)]: toCamelCase(v),
      };
    },
    {}
  );
};

export const createUser = async (userId: string, user: IState) => {
  const { firstName, lastName, username, phone, email } = user;
  let token = null;
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus === 'granted') {
      token = (
        await Notifications.getExpoPushTokenAsync({
          experienceId: '@lawlin/onecase',
        })
      ).data;
    }
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }
  await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName,
      username,
      push_token: token,
      // phone,
      // email,
    })
    .eq('id', userId);
  const { data } = await supabase.from('cases').select('id').match({
    created_by: userId,
    title: 'Assigned Tasks',
  });
  await supabase.from('tasks').insert({
    title: 'Learn how OneCase works',
    created_by: userId,
    case_id: data![0].id,
    assigned_to: userId,
    description: `Hey! Just wanted to give you a brief overview of the app. This is a task, a goal you want to accomplish like reading a book. Pressing the green clock lets you set a timer where you can’t touch for your phone so you can focus!
    Invite your friends into your “council” so they see your progress and when you fail your clock ins.  
    Invite your close friends to get the most out of the app, and reach us at @onecaseapp on insta for feedback and stuff! Have fun playing around with the app!
    `,
  });
};

/**
 * Fetch a single user
 * @param {number} userId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export const fetchUser = async (
  phone: string,
  email: string
): Promise<User | undefined> => {
  try {
    let { data } = await supabase
      .from<User>('users')
      .select('*')
      .eq('phone', phone);
    let user = data![0];
    if (!user) {
      ({ data } = await supabase
        .from<User>('users')
        .select('*')
        .eq('email', email));
      user = data![0];
    }

    return toCamelCase(user);
  } catch (error) {
    console.error('error', error);
  }
};

export const generateUsername = async (firstName: string, lastName: string) => {
  const sanitizedFirstName = firstName.replace(/[^a-z]/gi, '');
  const sanitizedLastName = lastName.replace(/[^a-z]/gi, '');

  let username = sanitizeUsername(
    `${sanitizedFirstName.charAt(0)}${sanitizedLastName}`
  );
  if (username.length < 3 && sanitizedFirstName.length > 1) {
    username = sanitizeUsername(
      `${sanitizedFirstName.charAt(0)}${sanitizedFirstName.charAt(
        1
      )}${sanitizedLastName}`
    );
  } else if (username.length < 3) {
    username = sanitizeUsername(`${username}1`);
  }
  const baseUsername = username;
  const { data } = await supabase
    .from('users')
    .select('username')
    .textSearch('username', `${baseUsername}:*`);
  if (data && data.length > 0) {
    const usernames = data.map((user) => user.username);
    let i = 1;
    while (usernames.includes(username)) {
      username = `${baseUsername}${i++}`;
    }
    if (username.length < 3) {
      username = `${username}`;
    }
  }
  return username;
};

export const checkUsername = async (username: string) => {
  const { data } = await supabase
    .from<User>('users')
    .select('*')
    .eq('username', sanitizeUsername(username));

  return data && data.length === 0 ? true : false;
};

export const updateAvatarUrl = async (base64Image: string) => {
  const currentUserId = supabase.auth.session()?.user?.id;
  const avatarUrlPath = `public/${currentUserId}.jpeg`;
  await supabase.storage
    .from('avatars')
    .upload(avatarUrlPath, decode(base64Image), {
      contentType: 'image/jpeg',
      upsert: true,
    });
  const { publicURL } = await supabase.storage
    .from('avatars')
    .getPublicUrl(avatarUrlPath);
  await supabase
    .from('users')
    .update({
      avatar_url: publicURL,
    })
    .eq('id', currentUserId);
};

export const finishOnboarding = async () => {
  const currentUserId = supabase.auth.session()?.user?.id;
  await supabase
    .from('users')
    .update({
      profile_created: true,
    })
    .eq('id', currentUserId);
};

export const fetchUsers = async () => {
  try {
    const currentUserId = supabase.auth.session()?.user?.id;
    const { data } = await supabase.from<User>('users').select('*');
    let updatedData = produce(data, (draft) => {
      const index = draft?.findIndex(
        (user) => user.id === currentUserId
      ) as number;
      if (index !== -1) draft?.splice(index, 1);
    });
    // let updatedData = data?.filter((user) => user.id !== currentUserId);
    const transformedData = toCamelCase(updatedData!);
    console.log('fetchUsers', transformedData);
    return transformedData as User[];
  } catch (error) {
    console.error('error', error);
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error', error);
  }
};

/**
 * Insert a new case into the DB
 * @param {string} slug The case
 * @param {number} user_id The channel creator
 */
export const addCase = async (
  index: number,
  title: string,
  emoji: string,
  color: string,
  users: string[]
) => {
  try {
    const currentUserId = supabase.auth.session()?.user?.id;
    const { data, error } = await supabase
      .from('cases')
      .insert([{ index, title, emoji, color, created_by: currentUserId }]);
    console.log('Error', error);
    if (!error) {
      if (data) {
        const caseId = data[0].id;
        await Promise.all(
          users.map(async (id) => {
            await supabase
              .from('users_cases')
              .insert([{ user_id: id, case_id: caseId }]);
          })
        );
      }
      return { data, error: false };
    } else {
      return { data: error.message, error: true };
    }
  } catch (error) {
    return { data: error, error: true };
  }
};

export const addTask = async (
  title: string,
  description: string,
  caseId: number
) => {
  try {
    const currentUserId = supabase.auth.session()?.user?.id;
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        { title, description, created_by: currentUserId, case_id: caseId },
      ]);

    if (!error) {
      console.log('addTask', data);
      return data;
    } else {
      console.error(error.message);
    }
  } catch (error) {
    console.error(error);
  }
};

export const fetchCases = async () => {
  try {
    const currentUserId = supabase.auth.session()?.user?.id;
    const { data } = await supabase
      .from('cases')
      .select(
        `
        id,
        title,
        emoji,
        color,
        users_cases (
          users (
            id,
            avatar_url
          )
        )
      `
      )
      .eq('created_by', currentUserId)
      .order('index', { ascending: true });
    if (data) {
      return toCamelCase(data);
    }
    return data;
  } catch (error) {
    console.log('error', error);
  }
};

/**
 * Fetches tasks where the case_id is null
 * @param caseId
 * @returns
 */
export const fetchTodos = async () => {
  try {
    const currentUserId = supabase.auth.session()?.user?.id;
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('created_by', currentUserId)
      .is('case_id', null)
      .order('created_at', { ascending: false });
    if (data) {
      console.log('fetchTodos', toCamelCase(data));
      return toCamelCase(data);
    }
    return data ?? [];
  } catch (error) {
    console.log('error', error);
  }
};

export const fetchTasks = async (caseId: number) => {
  try {
    const currentUserId = supabase.auth.session()?.user?.id;
    const { data, error } = await supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        description,
        progress,
        updates (
          id,
          created_at,
          title,
          old_progress,
          new_progress
        )
      `
      )
      .eq('created_by', currentUserId)
      .eq('case_id', caseId)
      .order('created_at');
    console.log(error);
    if (data) {
      // console.log('fetchTasks', toCamelCase(data));
      return toCamelCase(data);
    }
    return data ?? [];
  } catch (error) {
    console.log('error', error);
  }
};

export const addUpdate = async (
  taskId: number,
  title: string,
  oldProgress: number,
  newProgress: number
) => {
  try {
    const userId = supabase.auth.session()?.user?.id;
    await supabase
      .from('tasks')
      .update([{ progress: newProgress }])
      .eq('id', taskId);

    await supabase.from('updates').insert([
      {
        title,
        old_progress: oldProgress,
        new_progress: newProgress,
        created_by: userId,
        task_id: taskId,
      },
    ]);
  } catch (error) {
    console.log('error', error);
  }
};

export const fetchUpdates = async (
  taskId: number,
  title: string,
  oldProgress: number,
  newProgress: number
) => {
  try {
    const userId = supabase.auth.session()?.user?.id;
    await supabase
      .from('tasks')
      .update([{ progress: newProgress }])
      .eq('id', taskId);

    await supabase.from('updates').insert([
      {
        title,
        old_progress: oldProgress,
        new_progress: newProgress,
        created_by: userId,
        task_id: taskId,
      },
    ]);
  } catch (error) {
    console.log('error', error);
  }
};

export const clockIn = async (taskId: number) => {
  try {
    const { data } = await supabase.from('tasks').update({});
    if (data) {
      console.log('clockIn', toCamelCase(data));
      return toCamelCase(data);
    }
    return data ?? [];
  } catch (error) {
    console.log('error', error);
  }
};

export const searchUser = async (query: string) => {
  try {
    const { data } = await supabase
      .from('users')
      .select(
        `
        id,
        first_name,
        last_name,
        username,
        avatar_url
      `
      )
      .textSearch('username', `${query}:*`); // prefix matching
    if (data) {
      console.log('searchUser', toCamelCase(data));
      return toCamelCase(data);
    }
    return data ?? [];
  } catch (error) {
    console.log('error', error);
  }
};

export const updateUserHasFailedClockIn = async (hasFailedClockIn: boolean) => {
  const userId = supabase.auth.session()?.user?.id;
  await supabase
    .from('users')
    .update({
      has_failed_clock_in: hasFailedClockIn,
    })
    .eq('id', userId);
};

export const sendPushNotification = async (
  expoPushToken: string,
  receiverId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: any,
  caseId?: number | null,
  taskId?: number | null,
  taskCommentId?: number | null
) => {
  const userId = supabase.auth.session()?.user?.id;
  console.log('EXPO', expoPushToken, 'USER', receiverId);

  const message: any = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
  };
  if (data) {
    message.data = data;
  }

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  const resData = await res.json();
  console.log('notif response', resData);
  const { error } = await supabase.from('notifications').insert({
    sender_id: userId,
    receiver_id: receiverId,
    type,
    case_id: caseId,
    task_id: taskId,
    task_comment_id: taskCommentId,
  });
  if (error) {
    console.log('Error', error);
  }
};
