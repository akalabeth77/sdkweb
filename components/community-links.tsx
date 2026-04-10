import { getMessages, Locale } from '@/lib/i18n';

type CommunityLinksProps = {
  locale: Locale;
  title?: string;
  logoSize?: number;
};

const FACEBOOK_URL = 'https://www.facebook.com/swingdancekosice';
const INSTAGRAM_URL = 'https://www.instagram.com/swingdancekosice/';

export function CommunityLinks({ locale }: CommunityLinksProps) {
  const t = getMessages(locale);

  return (
    <section className="community-links">
      <div className="community-links-inline">
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">{t.common.facebook}</a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">{t.common.instagram}</a>
      </div>
    </section>
  );
}