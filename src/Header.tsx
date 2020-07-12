import React from 'react';

const Header: React.FC<{ text?: string}> = ({ text = 'default' }) => {
  return (
    <div>
      <h1>{text}</h1>
    </div>
  )
}

export default Header;
