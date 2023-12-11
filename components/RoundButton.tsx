function RoundButton({children, audioPlayer = false}) {
  return <div className={`${audioPlayer ? 'w-[calc(5rem_*_0.5)] h-[calc(5rem_*_0.5)]' : 'w-[calc(4rem_*_0.5)] h-[calc(4rem_*_0.5)]' } bg-fun-blue-300 dark:text-blog-black p-0.5 m-0.5 rounded-full flex items-center justify-center transition-filter duration-500 hover:filter hover:brightness-125`}>
  { children }
  </div>;
}

export default RoundButton