/** @type {import('expo/fingerprint').Config} */
const config = {
  sourceSkips: [
    "ExpoConfigVersions",
    "ExpoConfigRuntimeVersionIfString",
    "ExpoConfigExtraSection",
    "ExpoConfigEASProject",
  ],
};
module.exports = config;
