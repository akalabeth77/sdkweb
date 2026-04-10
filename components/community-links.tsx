import { getMessages, Locale } from '@/lib/i18n';

type CommunityLinksProps = {
  locale: Locale;
  title?: string;
  logoSize?: number;
};

const FACEBOOK_URL = 'https://www.facebook.com/swingdancekosice';
const INSTAGRAM_URL = 'https://www.instagram.com/swingdancekosice/';
const EMAIL = 'swing.kosice@gmail.com';
const LOGO_URL = 'https://instagram.fksc1-1.fna.fbcdn.net/v/t51.2885-19/100812902_4082498958457733_6369422601453830144_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fksc1-1.fna.fbcdn.net&_nc_cat=105&_nc_oc=Q6cZ2gFhaZZZjY1nwXf8tSmCSc-vV98p-tWSAgiF9vq-nNdYlOeB4ueFuIj9gb_A_qJ9gac&_nc_ohc=tgxTNTmegjoQ7kNvwFfCX-I&_nc_gid=72USSoYsbHX_QhKdp5limw&edm=AP4sbd4BAAAA&ccb=7-5&oh=00_Af0RO7SIZMpQy0mmTTMSEbLT_s2wQu9t7mTACtGs62Rqwg&oe=69DEE91B&_nc_sid=7a9f4b';

export function CommunityLinks({ locale, title, logoSize = 170 }: CommunityLinksProps) {
  const t = getMessages(locale);

  return (
    <section className="community-links">
      {title ? <h2>{title}</h2> : <h2>{t.footer.contactTitle}</h2>}
      <p className="small">{t.footer.followUs}</p>
      <img
        src={LOGO_URL}
        alt="Swing Dance Kosice logo"
        width={logoSize}
        height={logoSize}
        className="community-logo"
      />
      <p>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer">{t.common.facebook}</a>
      </p>
      <p>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">{t.common.instagram}</a>
      </p>
      <p>
        {t.footer.email}: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>
    </section>
  );
}