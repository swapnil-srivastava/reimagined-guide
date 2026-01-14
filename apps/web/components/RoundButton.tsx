import React from 'react';

const RoundButton = React.forwardRef<HTMLDivElement, { children: React.ReactNode; audioPlayer?: boolean; pink?: boolean }>(
  ({ children, audioPlayer = false, pink = false }, ref) => (
    <div
      ref={ref}
      className={`${audioPlayer ? 'w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)]' : 'w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)]'} ${pink ? 'bg-hit-pink-500' : 'bg-fun-blue-300'} text-black p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125`}
    >
      {children}
    </div>
  )
);

RoundButton.displayName = 'RoundButton';

export default RoundButton;