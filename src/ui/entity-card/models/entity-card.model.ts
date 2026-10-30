export type EntityCardData = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  badge: string;
  /** When set, the title is rendered as a router link to this URL. */
  titleLink?: string;
};
