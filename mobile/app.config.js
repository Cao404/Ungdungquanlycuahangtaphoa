module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  },
});
