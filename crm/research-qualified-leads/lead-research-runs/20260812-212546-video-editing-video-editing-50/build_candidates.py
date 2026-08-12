import json
from pathlib import Path

OBSERVED = "2026-08-12"
STEPSTONE_EDITOR = "https://www.stepstone.de/jobs/videoeditor"
STEPSTONE_PRODUCER = "https://www.stepstone.de/jobs/video-producer"

# Only compensation figures explicitly published on the matching job-detail page.
# Generic portal estimates are intentionally excluded.
BUDGETS = {
    "PBMvisuals GmbH": ("32.000–45.000 EUR brutto/Jahr", "https://de.indeed.com/viewjob?jk=ccd6365913746f84"),
    "Falk Berberich Consulting": ("2.900 EUR brutto/Monat (Einstiegsgehalt)", "https://talents.studysmarter.de/companies/falkberberich/videoeditor-cutter-vollzeit-m-w-d-3192378/"),
    "Continu-ING GmbH": ("4.000 EUR brutto/Monat", "https://karriere.continu-ing.com/o/videoeditor-auch-quereinstieg-mwd"),
    "BEWEGT.content GmbH": ("30.000–40.000 EUR/Jahr", "https://www.arbeitsagentur.de/jobsuche/suche?angebotsart=1&was=Video"),
    "the social. Academy GmbH": ("ab 3.000 EUR brutto/Monat", "https://karriere.social-academy.at/o/video-editor-vollzeit-mwd"),
    "fonio GmbH": ("55.000–80.000 EUR brutto/Jahr", "https://jobs.ashbyhq.com/fonio/d6099f0b-4903-4a4e-8caf-7c078de8b7d9"),
    "BlackWood GmbH": ("3.000 EUR brutto/Monat (Einstiegsgehalt, 40 Std.)", "https://talents.studysmarter.de/companies/blackwood-gmbh/videographer-video-content-creator-m-w-d-4648195/"),
    "twentythree GmbH": ("1.446–1.807 EUR/Monat (Teilzeit)", "https://join.com/companies/twentythree"),
    "L1VE Germany GmbH": ("48.000–58.000 EUR/Jahr", "https://join.com/companies/soft-seedcom/16465099-post-production-producer-360-vr"),
}

# name, website, country, city, title, evidence URL, contact URL, email, phone
ROWS = [
    ("Neona Living GmbH", "https://www.neona.store", "DE", "Köln", "Video-Editor/in (m/w/d)", STEPSTONE_EDITOR, "https://www.neona.store/pages/impressum", "support@neona.store", "+49 214 50680266"),
    ("DATRON AG", "https://www.datron.de", "DE", "Ober-Ramstadt", "Video Content Creator (m/w/d)", STEPSTONE_EDITOR, "https://webshop.datron.de/Informationen/Impressum/", "info@datron.de", "+49 6154 637660"),
    ("PBMvisuals GmbH", "https://pbmvisuals.de", "DE", "Hamm", "Video Content Creator (m/w/d)", STEPSTONE_EDITOR, "https://pbmvisuals.de/impressum/", "service@pbmvisuals.de", "+49 2381 8769988"),
    ("Binder Optik GmbH", "https://www.binder-optik.de", "DE", "Böblingen", "Video & Foto Creator (m/w/d) mit Fokus KI", STEPSTONE_EDITOR, "https://www.binder-optik.de/impressum/", "info@binder-optik.de", "+49 7031 62070"),
    ("Dr. O. K. Wack Chemie GmbH", "https://wack-group.com", "DE", "Baar-Ebenhausen", "Junior Video Content Creator - Technik / Social Media (m/w/d)", STEPSTONE_EDITOR, "https://wack-group.com/en/contact/", "", "+49 8453 41995100"),
    ("Anker Marketing GmbH", "https://www.anker-marketing.com", "DE", "Frankfurt am Main", "Video Editor*in GESUCHT! - Freelance / Vollzeit", STEPSTONE_EDITOR, "https://www.anker-marketing.com/impressum", "info@anker-marketing.com", "+49 152 33717046"),
    ("Unseen Media GmbH", "https://unseenmedia.de", "DE", "Berlin", "Freelance Video Editor (m,w,d)", STEPSTONE_EDITOR, "https://unseenmedia.de/", "nico@unseenmedia.de", "+49 1512 9467227"),
    ("Dschungel Marketing GmbH", "https://www.dschungel.io", "DE", "Berlin", "Video Editor Performance Marketing (all genders)", STEPSTONE_EDITOR, "https://www.dschungel.io/impressum", "hallo@dschungel.io", "+49 157 88894760"),
    ("Priesmeier Sicherheit Systeme GmbH", "https://priesmeier-sicherheit.de", "DE", "Braunschweig", "Performance Video Editor / Cutter (m/w/d) Direct Response & Meta Ads | Freelance", STEPSTONE_EDITOR, "https://priesmeier-sicherheit.de/impressum/", "info@priesmeier-sicherheit.de", "+49 531 243990"),
    ("MWA Media Works Agency GmbH", "https://www.media-works.de", "DE", "Hamburg", "AI Video Editor / Social Media Cutter", STEPSTONE_EDITOR, "https://www.media-works.de/imprint", "info@media-works.de", "+49 40 63855272"),
    ("Falk Berberich Consulting", "https://www.falkberberich.com", "DE", "Villingen-Schwenningen", "Videoeditor / Cutter - Vollzeit (m/w/d)", STEPSTONE_EDITOR, "https://www.falkberberich.com/rechtliches/impressum", "info@falkberberich.com", "+49 176 55700504"),
    ("Baulig Consulting GmbH", "https://www.andreasbaulig.de", "DE", "Koblenz", "Video Editor/-in - Vollzeit (m/w/d)", STEPSTONE_EDITOR, "https://www.andreasbaulig.de/impressum", "kontakt@andreasbaulig.de", "+49 173 7458514"),
    ("Continu-ING GmbH", "https://www.continu-ing.com", "DE", "Wittlich", "Videoeditor (auch Quereinstieg) (m/w/d)", STEPSTONE_EDITOR, "https://www.continu-ing.com/impressum", "kontakt@continu-ing.com", "+49 6571 95593100"),
    ("adbaker GmbH", "https://www.adbaker.de", "DE", "Köln", "Video Editor - all genders", STEPSTONE_EDITOR, "https://www.adbaker.de/transparenz/kunden", "mail@adbaker.de", "+49 221 99983680"),
    ("Boost Media GmbH", "https://www.videoboost.de", "DE", "Darmstadt", "Videograph / Video Editor (m/w/d)", STEPSTONE_EDITOR, "https://www.videoboost.de/legal/impressum/", "info@videoboost.de", "+49 6151 62938122"),
    ("Uplift Marketing GmbH", "https://uplift-marketing.eu", "DE", "Fulda", "Video Editor Social Ads (m/w/d) 32-40 Std.", STEPSTONE_EDITOR, "https://uplift-marketing.eu/impressum/", "info@uplift-marketing.eu", ""),
    ("Holzhey-Consulting GmbH", "https://www.katjaholzhey.com", "DE", "Mannheim", "Videograph & Video-Editor (m/w/d)", STEPSTONE_EDITOR, "https://www.katjaholzhey.com/impressum", "hallo@katjaholzhey.com", "+49 151 54166349"),
    ("everydays GmbH", "https://www.everydays.de", "DE", "Berlin", "Video Editor / AI Creative Cutter (m/w/d) - Video Ads für Meta & Co", STEPSTONE_EDITOR, "https://www.everydays.de/pages/impressum", "service@everydays.de", ""),
    ("Uhl Werbeagentur GmbH", "https://uhl-werbeagentur.de", "DE", "Augsburg", "Video Editor (m/w/d) - Teilzeit", STEPSTONE_EDITOR, "https://uhl-werbeagentur.de/", "info@uhl-werbeagentur.de", "+49 821 38043"),
    ("G-IN GmbH", "https://g-in-gmbh.de", "DE", "Stuttgart", "Video-Editor / Motion Designer (m/w/d)", STEPSTONE_EDITOR, "https://g-in-gmbh.de/impressum/", "office@g-in.de", ""),
    ("Cheggl GmbH", "https://www.cheggl.com", "DE", "Hamburg", "Video Editor:in", STEPSTONE_EDITOR, "https://www.cheggl.com/impressum", "hallo@cheggl.com", "+49 40 334684480"),
    ("DartSturm GmbH", "https://dartsturm.de", "DE", "Naila", "(Junior) Video Content Creator / Social Media (m/w/d)", STEPSTONE_EDITOR, "https://dartsturm.de/Informationen/AGB/", "kundenservice@dartsturm.de", "+49 9282 9324822"),
    ("Saykos GmbH", "https://saykos.de", "DE", "Heek", "Foto- & Video-Content Creator (m/w/d) – Beauty- & Friseurbranche", STEPSTONE_EDITOR, "https://saykos.de/de/impressum", "info@saykos.de", "+49 2568 9099020"),
    ("Gauder GmbH", "https://gauder.net", "DE", "Berlin", "Video Content Creator & Brand Personality Social Media (m/w/d)", STEPSTONE_EDITOR, "https://gauder.net/en/pages/imprint", "hallo@gauder.net", "+49 385 48930970"),
    ("O.C. Hairsystems GmbH", "https://oc-hairsystems.ch", "DE", "Düsseldorf", "Videographer & Social Content Creator (m/w/d)", STEPSTONE_PRODUCER, "https://oc-hairsystems.ch/impressum/", "kontakt@oc-hairsystems.com", "+49 211 22975318"),
    ("BRABUS GmbH", "https://www.brabus.com", "DE", "Bottrop", "Videograph / Cinematograph - Serien & Dokumentationen (m/w/d)", STEPSTONE_PRODUCER, "https://www.brabus.com/en-ee/imprint.html", "", "+49 2041 7770"),
    ("planetlan GmbH", "https://planetlan.de", "DE", "Bochum", "Mediengestalter Bild & Ton / Videograf – mit FPV-Skills (m/w/d)", STEPSTONE_PRODUCER, "https://planetlan.de/de/impressum.htm", "", "+49 2327 369420"),
    ("Pending System GmbH & Co. KG", "https://www.cube.eu", "DE", "Waldershof", "Video Producer (m/w/d)", STEPSTONE_PRODUCER, "https://www.cube.eu/de-de/impressum", "", "+49 9231 97007845"),
    ("J.L.B. Gaststättenbetrieb GmbH", "https://landhaus-walter.de", "DE", "Hamburg", "Video Producer (m/w/d)", STEPSTONE_PRODUCER, "https://landhaus-walter.de/impressum/", "impressum@landhaus-walter.de", ""),
    ("Ordio GmbH", "https://www.ordio.com", "DE", "Köln", "Creative Video Producer (m/f/d)", STEPSTONE_PRODUCER, "https://www.ordio.com/datenschutz", "hallo@ordio.com", ""),
    ("ABH24 GmbH & Co. KG", "https://www.abh24.com", "DE", "Bielefeld", "Videograf / Creative Video Producer (m/w/d)", STEPSTONE_PRODUCER, "https://www.abh24.com/impressum", "info@abh24.com", "+49 521 99997580"),
    ("BEWEGT.content GmbH", "https://www.bewegt-content.com", "DE", "Neusäß", "Video Producer / Editor – Foto, Film & KI (m/w/d)", STEPSTONE_PRODUCER, "https://www.bewegt-content.com/Kontakt/", "", "+49 821 99959062"),
    ("Scalecom GmbH", "https://www.scalecom.de", "DE", "Neu-Isenburg", "Videograf & Cutter für Social Media Ads (m/w/d)", STEPSTONE_PRODUCER, "https://www.scalecom.de/impressum", "info@scalecom.de", "+49 157 73730402"),
    ("Fitklusiv GmbH", "https://fitklusiv.de", "DE", "Düsseldorf", "Content Creator / Videograf (Festanstellung)", STEPSTONE_PRODUCER, "https://fitklusiv.de/studios/", "kontakt@fitklusiv.de", "+49 211 68788299"),
    ("CMF Advertising GmbH", "https://www.cmf.de", "DE", "Oberursel", "Junior Videographer & Motion Designer (m/w/d)", STEPSTONE_PRODUCER, "https://www.cmf.de/impressum/", "frankfurt@cmf.de", "+49 6171 88780"),
    ("IMAGETOWN GmbH", "https://imagetown.de", "DE", "Schönefeld", "Immobilienfoto/videografIn", STEPSTONE_PRODUCER, "https://imagetown.de/kontakt/", "hello@imagetown.de", "+49 30 233285540"),
    ("DMV Deutsche Mittelstandsversorgung GmbH", "https://dmv-karriere.de", "DE", "Landshut", "Foto- & Videograph/in Vollzeit", STEPSTONE_PRODUCER, "https://dmv-karriere.de/impressum/", "kontakt@betriebsrente.de", "+49 871 97309220"),
    ("the social. Academy GmbH", "https://social-academy.at", "AT", "Salzburg", "Video Editor Vollzeit", "https://social-academy.at/karriere/", "https://social-academy.at/impressum/", "info@social-academy.at", "+43 660 3733587"),
    ("Quantum-Systems GmbH", "https://quantum-systems.com", "DE", "Gilching", "Videoeditor / Cutter (m/f/d)", "https://quantum-systems.com/career/", "https://quantum-systems.com/legal-notice/", "info@quantum-systems.com", "+49 8105 7709100"),
    ("fonio GmbH", "https://fonio.info", "AT", "Wien", "Video Cutter / Post-Production", "https://jobs.ashbyhq.com/fonio", "https://fonio.info/de/articles/legal", "info@fonio.ai", ""),
    ("Heritsch Media GmbH", "https://www.heritsch-media.at", "AT", "Lieboch", "Video Cutter & Editor", STEPSTONE_EDITOR, "https://www.heritsch-media.at/impressum", "impressum@heritsch-media.at", ""),
    ("Universität Wien", "https://www.univie.ac.at", "AT", "Wien", "Mitarbeiter*in Video Content Production – freier Dienstvertrag", STEPSTONE_PRODUCER, "https://www.univie.ac.at/impressum/", "", "+43 1 427737012"),
    ("BlackWood GmbH", "https://www.oscarkarem.com", "AT", "Wien", "Videograph (m/w/d)", STEPSTONE_PRODUCER, "https://www.oscarkarem.com/impressum", "mail@oscarkarem.com", "+43 660 6251710"),
    ("ZOOOM Productions GmbH", "https://www.zooom.com", "AT", "Fuschl am See", "Videographer, Editor & Content Creator", "https://www.zooom.com/en_eu/agency/offices/zooom-fuschl-am-see", "https://www.zooom.com/en_eu/agency/offices/zooom-fuschl-am-see", "europe@zooom.com", "+43 6226 88480"),
    ("NinetoSix GmbH", "https://www.ninetosix.de", "DE", "Nürnberg", "Video Editor:in", STEPSTONE_EDITOR, "https://www.ninetosix.de/kontakt", "info@ninetosix.de", "+49 911 38466016"),
    ("Osteopathie Praxis Benkmann", "https://osteopathie-benkmann.com", "DE", "Hamburg", "Mediengestalter:in / Video Content Creator (YouTube) Konzept, Dreh & Schnitt", STEPSTONE_EDITOR, "https://osteopathie-benkmann.com/impressum/", "info@osteopathie-benkmann.com", "+49 40 64850258"),
    ("twentythree GmbH", "https://twentythree.de", "DE", "Esslingen am Neckar", "Video Content Creator (m/w/d) Social Media", STEPSTONE_EDITOR, "https://twentythree.de/pages/datenschutz", "team@twentythree.de", "+49 711 90755917"),
    ("L1VE Germany GmbH", "https://www.l1ve.com", "DE", "Berlin", "Post-production Producer (360° VR) (f,m,x)", STEPSTONE_EDITOR, "https://www.l1ve.com/terms", "info@l1ve.com", ""),
    ("urbanuncut GmbH", "https://www.urbanuncut.de", "DE", "München", "Cutter/Editor:in", STEPSTONE_EDITOR, "https://www.urbanuncut.de/kontakt/", "", "+49 89 21529461"),
    ("dibido.tv GmbH", "https://www.dibido.tv", "AT", "Wien", "Cutter:in / Editor:in, Vollzeit 40h", "https://www.dibido.tv/jobs", "https://www.dibido.tv/jobs", "jobs@dibido.tv", ""),
]


def make_candidate(row):
    name, website, country, city, title, evidence_url, contact_url, email, phone = row
    unavailable = {}
    enrichment = {"attempted": True, "pages_checked": [contact_url], "unavailable_reasons": unavailable}
    if email:
        enrichment["email_source_url"] = contact_url
    else:
        unavailable["email"] = "NOT_PUBLISHED"
    if phone:
        enrichment["phone_source_url"] = contact_url
    else:
        unavailable["phone"] = "NOT_PUBLISHED"
    candidate = {
        "name": name,
        "website_url": website,
        "country": country,
        "city": city,
        "mode": "VIDEO_EDITING",
        "evidence": [{
            "source_url": evidence_url,
            "source_type": "company_career_page" if website.split("//", 1)[1].split("/", 1)[0] in evidence_url else "job_board",
            "observed_at": OBSERVED,
            "signal_category": "DIRECT_EDITING_VACANCY",
            "job_title": title,
            "factual_summary": f"Die aktuell beobachtete Ausschreibung nennt ausdrücklich die Position „{title}“.",
            "current_state": "open",
        }],
        "primary_source_url": evidence_url,
        "budget_enrichment": {
            "attempted": True,
            "pages_checked": [evidence_url],
            "unavailable_reason": "NOT_PUBLISHED",
        },
        "email": email,
        "phone": phone,
        "contact_enrichment": enrichment,
        "score_components": [{"reason": "DIRECT_EDITING_VACANCY", "points": 60}],
        "ai_notes": f"Fakt: {name} schreibt aktuell die Position „{title}“ aus und signalisiert damit konkreten Bedarf an laufender Video-Postproduktion. Ansatz: Als externer Editing-Partner lassen sich Kapazitätsspitzen abfangen, Durchlaufzeiten verkürzen und wiederkehrende Formate mit einem verlässlichen, skalierbaren Workflow unterstützen.",
    }
    if name in BUDGETS:
        budget, budget_source_url = BUDGETS[name]
        candidate["budget"] = budget
        candidate["budget_source_url"] = budget_source_url
        candidate["budget_enrichment"] = {
            "attempted": True,
            "pages_checked": list(dict.fromkeys([evidence_url, budget_source_url])),
        }
        if budget_source_url != evidence_url:
            candidate["evidence"].append({
                "source_url": budget_source_url,
                "source_type": "job_board",
                "observed_at": OBSERVED,
                "signal_category": "DIRECT_EDITING_VACANCY",
                "job_title": title,
                "factual_summary": f"Die konkrete Stellenanzeige veröffentlicht für die Position eine Vergütung von {budget}.",
                "current_state": "open",
            })
    return candidate


assert len(ROWS) == 50, len(ROWS)
out = Path(__file__).with_name("candidates.json")
out.write_text(json.dumps([make_candidate(row) for row in ROWS], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(out)
