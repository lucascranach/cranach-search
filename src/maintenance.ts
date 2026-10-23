/*
  While true, the app shows a maintenance notice before the search.
  The notice can be dismissed (e.g. by people reaching the API via VPN);
  the API is only requested after that.
  Set to false (and rebuild) once the API is reachable again.
*/
export const MAINTENANCE_MODE = true;

/* The dismissal lasts until the browser tab is closed */
const DISMISSED_STORAGE_KEY = 'cranachSearchMaintenanceNoticeDismissed';

export const isMaintenanceNoticeDismissed = (): boolean => {
  try {
    return window.sessionStorage.getItem(DISMISSED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const dismissMaintenanceNotice = () => {
  try {
    window.sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
  } catch {
    /* Without storage the notice is simply shown again on the next page load */
  }
};
