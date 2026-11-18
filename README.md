# SLD Events planning intake and quote estimate

A single-page intake form for [SLD Events](https://eventsbystacey.com) (Events by Stacey in Baltimore, Maryland). Clients describe the event and see a live, itemized planning-fee estimate, then send the request to Stacey by email or print a PDF.

## Important: sample rates

The services page on eventsbystacey.com does not list prices. It says package prices are placeholders. The numbers in `app.js` (`const RATES` at the top) are sample Mid-Atlantic planning-fee ranges for discussion only. They are not published SLD Events rates.

When official fees are ready, edit `RATES` in `app.js` only. The on-page disclaimer should be updated at the same time if the figures become hers.

The estimate covers planning and coordination time. It does not include venue, catering, florals, rentals, or other vendor costs.

## Contact

Requests open a prefilled email to Stacey@eventsbystacey.com, the address published on the site. No phone number is listed on the public site.

## Branding

Colors, typography (Bodoni Moda and Josefin Sans), and the SLD Events logo are taken from the official eventsbystacey.com theme. The logo is not a recreation.

## Deploy

Static files. Render builds with `true` and publishes the repo root. Push to `main` to update the live site.
