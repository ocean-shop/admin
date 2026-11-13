import { HttpContextToken } from '@angular/common/http';

/** Background requests (polling, live updates) set it so the global loader does not flash. */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);
