const generateMetaDescription = (input: string) => {
  if (input && input?.length === 0) return;
  if (input?.length > 100) {
    return input?.substring(0, 100) + "...";
  }
  return input;
};

const getLocalStorage = (key: string, defaultValue:any) => {
  const stickyValue = localStorage.getItem(key);

  return (stickyValue !== null && stickyValue !== 'undefined')
      ? JSON.parse(stickyValue)
      : defaultValue;
}

const setLocalStorage = (key: string, value:any) => {
  localStorage.setItem(key, JSON.stringify(value));
}

export { generateMetaDescription, getLocalStorage, setLocalStorage};
