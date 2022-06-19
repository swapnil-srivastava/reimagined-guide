import React from 'react'

function Loader({show}) {
  return show ? <div className='loader'></div> : null;
}

export default Loader