# Internationalization

UI locale and conversation language are separate. i18next controls interface strings; Redux stores the user's preferred backend conversation language. A French UI may send mixed Lingala/French content without normalization.

English and French UI resources are MVP-supported. Lingala and Swahili currently fall back to reviewed English strings and carry explicit translator TODO metadata; fabricated translations are prohibited. Add translations only after fluent human review. Preserve backend transcripts exactly, including accents, mixed scripts, and code-switching metadata.

Language codes come from the canonical `UWACI_LANGUAGES` configuration. Components must not scatter language literals or assume every device provides every TTS voice.
