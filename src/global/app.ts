import { GlobalConfig } from '../utils/config';

export default async () => {
  /**
   * The code to be executed should be placed within a default function that is
   * exported by the global script. Ensure all of the code in the global script
   * is wrapped in the function() that is exported.
   */

  window['NIMIQ_IQONS_SVG_PATH'] = location.origin + GlobalConfig.base + GlobalConfig.iqons;
};
