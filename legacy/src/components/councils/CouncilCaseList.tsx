import React from 'react';
import { FlatList } from 'react-native';
import CouncilCaseItem from './CouncilCaseItem';
import { Case } from '../../types';

const cases: Case[] = [
  {
    id: 1,
    owner: 'user1',
    title: 'To-Dos',
    description: 'Tasks your "friends" assigned you',
    tasks: [
      {
        id: 1,
        title: 'Press the + button and follow the instructions',
        description:
          'There’s not much to say about this besides you know, following the exact instructions. So we hope you figure things out quickly and enjoy the app!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 2,
        title: 'Invite an accountability partner',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 3,
        title: 'Finish reading a couple substacks',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 4,
        title: 'Invite an accountability partner',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 5,
        title: 'Finish reading a couple substacks',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 6,
        title: 'Finish reading a couple substacks',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 7,
        title: 'Finish reading a couple substacks',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
    ],
    council: ['user1', 'user2'],
  },
  {
    id: 2,
    owner: 'user2',
    title: 'Product Management',
    description: 'Studying to get into PM',
    tasks: [
      {
        id: 8,
        title: 'Read the book “Cracking the PM Interviews',
        description:
          'There’s not much to say about this besides you know, following the exact instructions. So we hope you figure things out quickly and enjoy the app!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 9,
        title: 'Finish reading a couple substacks',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
      {
        id: 10,
        title: 'Invite an accountability partner',
        description: 'Go an invite someone!',
        image:
          'https://cdn.discordapp.com/attachments/736717399159734342/853742073705136158/unknown.png',
      },
    ],
    council: ['user1', 'user2'],
  },
];

const CouncilCaseList = ({ navigation }: any) => {
  const renderCaseItem = ({ item }: { item: Case }) => {
    return <CouncilCaseItem caseItem={item} navigation={navigation} />;
  };
  return (
    <FlatList
      data={cases}
      renderItem={renderCaseItem}
      keyExtractor={(item) => item.title}
      listKey='council-cases'
    />
  );
};

export default CouncilCaseList;
