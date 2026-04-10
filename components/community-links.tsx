import { getMessages, Locale } from '@/lib/i18n';

type CommunityLinksProps = {
  locale: Locale;
  title?: string;
  logoSize?: number;
};

const FACEBOOK_URL = 'https://www.facebook.com/swingdancekosice';
const INSTAGRAM_URL = 'https://www.instagram.com/swingdancekosice/';
const EMAIL = 'swing.kosice@gmail.com';
const LOGO_URL = '/swing-dance-kosice-logo.jpg';

export function CommunityLinks({ locale, title, logoSize = 170 }: CommunityLinksProps) {
  const t = getMessages(locale);

  return (
    <section className="community-links">
      {title ? <h2>{title}</h2> : <h2>{t.footer.contactTitle}</h2>}
      <div className="community-links-row">
        <img
          src={LOGO_URL}
          alt="Swing Dance Kosice logo"
          width={logoSize}
          height={logoSize}
          className="community-logo"
        />
        <div className="community-links-inline">
          <span className="small">{t.footer.followUs}</span>
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">{t.common.facebook}</a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">{t.common.instagram}</a>
          <span>
            {t.footer.email}: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </span>
        </div>
      </div>
    </section>
  );
}