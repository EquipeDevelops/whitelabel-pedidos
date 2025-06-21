import React from 'react';

const GlobalContext = React.createContext({});

export const GlobalStorage = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <GlobalContext.Provider value={{}}>
      { children }
    </GlobalContext.Provider>
  )
};
