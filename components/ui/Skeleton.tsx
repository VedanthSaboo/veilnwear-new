// components/ui/Skeleton.tsx
import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, className }) => {
  const style: React.CSSProperties = {
    width,
    height,
  };

  return <div style={style} className={className} />;
};

export default Skeleton;
