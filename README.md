# NeverQuit — Sesiunea 3: PWA instalabilă

## REALIZAT

- manifest PWA;
- pictograme 192×192 și 512×512;
- mod standalone când aplicația este instalată;
- buton de instalare pe Android, când Chrome îl pune la dispoziție;
- service worker pentru funcționare offline;
- actualizarea automată a cache-ului între versiuni;
- fișier `.nojekyll` pentru publicare statică directă pe GitHub Pages.

## Fișiere noi

- `manifest.webmanifest`
- `service-worker.js`
- `.nojekyll`
- `icons/icon-192.png`
- `icons/icon-512.png`

## Cum actualizezi GitHub

În repository-ul `neverquit`:

1. încarcă toate fișierele și folderul `icons`;
2. acceptă înlocuirea fișierelor `index.html`, `styles.css`, `app.js` și `README.md`;
3. fă commit direct în ramura `main`;
4. așteaptă publicarea GitHub Pages;
5. deschide aplicația pe Android în Chrome;
6. reîncarcă pagina o dată;
7. apasă butonul „Instalează”, dacă apare, sau meniul Chrome → „Instalează aplicația”.

## Test offline

După ce ai deschis aplicația cel puțin o dată online:

1. închide aplicația;
2. oprește Wi‑Fi și datele mobile;
3. deschide NeverQuit din pictograma de pe ecran;
4. verifică dacă se deschide și dacă misiunile pot fi bifate.
