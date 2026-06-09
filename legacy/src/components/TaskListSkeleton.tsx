import React from 'react';
import ContentLoader, { Rect, Circle, Path } from 'react-content-loader/native';

const TaskListSkeleton = ({ ...props }) => (
  <ContentLoader
    speed={2}
    width={400}
    height={812}
    viewBox='0 0 400 812'
    backgroundColor='#f3f3f3'
    foregroundColor='#ecebeb'
    {...props}
  >
    <Rect x='51' y='51' rx='0' ry='0' width='290' height='37' />
    <Rect x='50' y='114' rx='0' ry='0' width='293' height='65' />
    <Rect x='52' y='207' rx='0' ry='0' width='291' height='60' />
    <Rect x='134' y='292' rx='0' ry='0' width='111' height='24' />
  </ContentLoader>
);

export default TaskListSkeleton;
