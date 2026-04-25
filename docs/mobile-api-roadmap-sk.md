# Mobile API roadmap

## Ciel
- zachovat web login cez NextAuth pre browser
- pripravit oddelene `api/v1` endpointy pre buducu React Native / Expo appku
- nepustat mobil priamo na databazu

## Aktualne endpointy pre mobil/public klientov
- `POST /api/v1/auth/token`
- `GET /api/v1/articles`
- `GET /api/v1/events`
- `GET /api/v1/user/profile`
- `PUT /api/v1/user/profile`
- `GET /api/v1/user/registrations`
- `GET /api/v1/events/:id/register`
- `POST /api/v1/events/:id/register`
- `DELETE /api/v1/events/:id/register`
- `GET /api/v1/user/notifications`
- `PUT /api/v1/user/notifications`
- `GET /api/v1/user/devices`
- `POST /api/v1/user/devices`
- `DELETE /api/v1/user/devices`

## Auth strategia
- Web: ponechat `NextAuth` session cookies.
- Mobil: pouzivat `POST /api/v1/auth/token` a JWT bearer token.
- Prechodova strategia:
  - nove mobilne endpointy drzat pod `api/v1`
  - browser admin endpointy nechat pod `api/admin`
  - ked bude treba, doplnit shared bearer-token middleware pre `api/v1/user/*`

## Dalsie odporucane kroky
- pridat refresh token flow alebo kratkozijuce access tokeny
- zaviest bearer-token validaciu aj pre user endpointy v `api/v1`
- pridat endpoint na detail eventu a detail clanku cez slug
- doplnit push delivery worker pre Expo / FCM / APNs
- pridat audit log a rate limiting pre auth endpointy

## Test TODO
- otestovat registraciu na event a zrusenie registracie
- otestovat ze public API nevracia draft clanky bez opravnenia
- otestovat ze `api/admin/*` write operacie zlyhaju bez editor/admin session
- otestovat mobile login token flow s approved aj pending userom
