# SLD Events planning intake and quote estimate

A single-page intake form for [SLD Events](https://eventsbystacey.com), serving the Baltimore and Washington, DC area. Clients choose an occasion (wedding, Bar or Bat Mitzvah, or celebration) and a planning package, see a live estimate, then email Stacey or print a PDF.

## Official starting prices

These come from the SLD Events pricing sheet:

- Day-of Coordination starts at $1,200
- Full-Service Planning starts at $4,200

Final pricing depends on guest count, venue, and the scope of the celebration, and is confirmed in a written quote after a free consultation. A 50% deposit reserves the date. The balance is due before the event. Vendor and venue costs are paid by the client directly and are not included.

## Sample adjustments

Guest count, short-timeline, and travel adjustments in `app.js` (`RATES.guestAdjust`, `RATES.rush`, `RATES.travel`) are sample estimate ranges only. They are not published fees. Edit that SAMPLE section when official adjustment amounts are ready. Leave the package `starting` values alone unless the published starting prices change.

## Contact

Requests open a prefilled email to Stacey@eventsbystacey.com, the address published on eventsbystacey.com. No phone number is listed on the public site.

## Branding

Colors, typography (Bodoni Moda and Josefin Sans), and the SLD Events logo are taken from the official eventsbystacey.com theme. The logo is not a recreation.

## Deploy

Static files. Render builds with `true` and publishes the repo root. Push to `main` to update the live site.
