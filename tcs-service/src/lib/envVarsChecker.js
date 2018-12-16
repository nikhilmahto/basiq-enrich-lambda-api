export default env => {
  const required = ['BASIQ_USER_TOKEN', 'COUNTRY', 'INSTITUTION_ID'];
  const missing = [];

  required.forEach(reqVar => {
    if (!env[reqVar]) {
      missing.push(reqVar);
    }
  });

  return missing;
};
