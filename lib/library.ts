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

const PRODUCT_INITIAL_QUANTITY = 1;
const PRODUCT_QUANTITY_INCREMENT = 1;
const PRODUCT_QUANTITY_DECREMENT = 1;

const DELIVERY_OPTIONS = {
  DHL: 'DHL',
  HERMES: 'Hermes',
  UPS: 'UPS',
  EMAIL: 'Email'
};

export { generateMetaDescription, getLocalStorage, setLocalStorage, 
  PRODUCT_INITIAL_QUANTITY, PRODUCT_QUANTITY_INCREMENT, 
  PRODUCT_QUANTITY_DECREMENT, DELIVERY_OPTIONS
};
