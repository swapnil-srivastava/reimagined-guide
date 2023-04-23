const generateMetaDescription = (input: string) => {
  if (input && input?.length === 0) return;
  if (input?.length > 100) {
    return input?.substring(0, 100) + "...";
  }
  return input;
};

export { generateMetaDescription };
