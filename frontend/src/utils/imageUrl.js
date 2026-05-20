import api from '../api/axios';

export const getImageUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return new URL(url, api.defaults.baseURL).toString();
};
