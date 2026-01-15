import React from 'react'

interface LoaderProps {
  show?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ show = false }) => {
  return show ? <div className='loader' /> : null;
}

export default Loader;