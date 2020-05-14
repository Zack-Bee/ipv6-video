const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {'content-type': 'application/json', ...options.headers},
  });
  return res.json();
};

export default fetchJSON;
