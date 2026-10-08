-- This works only on Postgresql!
BEGIN;

DROP TABLE IF EXISTS quiz_responses CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_question_options CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS iala_lights CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS result CASCADE;
DROP TABLE IF EXISTS account CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;

CREATE TYPE user_role AS ENUM ('admin', 'user');

CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role    NOT NULL DEFAULT 'user',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX users_username_lower_key ON users (lower(username));

CREATE TABLE quizzes (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE iala_lights (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    category    VARCHAR(100) NOT NULL,
    rhythm      VARCHAR(100) NOT NULL,
    description TEXT,
    config      JSONB        NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE quiz_questions (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id       UUID        NOT NULL,
    iala_light_id UUID,
    question_text TEXT,
    position      INT         NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT quiz_questions_quiz_id_fkey
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT quiz_questions_iala_light_id_fkey
        FOREIGN KEY (iala_light_id) REFERENCES iala_lights (id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE quiz_question_options (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID        NOT NULL,
    iala_light_id UUID,
    option_text TEXT,
    is_correct  BOOLEAN     NOT NULL DEFAULT FALSE,
    position    INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT quiz_question_options_question_id_fkey
        FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT quiz_question_options_iala_light_id_fkey
        FOREIGN KEY (iala_light_id) REFERENCES iala_lights (id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE quiz_attempts (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL,
    quiz_id    UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT quiz_attempts_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT quiz_attempts_quiz_id_fkey
        FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE quiz_responses (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id         UUID        NOT NULL,
    question_id        UUID        NOT NULL,
    selected_option_id UUID        NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT quiz_responses_attempt_id_fkey
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT quiz_responses_question_id_fkey
        FOREIGN KEY (question_id) REFERENCES quiz_questions (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT quiz_responses_selected_option_id_fkey
        FOREIGN KEY (selected_option_id) REFERENCES quiz_question_options (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);
CREATE INDEX idx_quiz_questions_iala_light_id ON quiz_questions (iala_light_id);
CREATE INDEX idx_quiz_question_options_question_id ON quiz_question_options (question_id);
CREATE INDEX idx_quiz_question_options_iala_light_id ON quiz_question_options (iala_light_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts (user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts (quiz_id);
CREATE INDEX idx_quiz_responses_attempt_id ON quiz_responses (attempt_id);

-- One answer per question in an attempt.
CREATE UNIQUE INDEX quiz_responses_attempt_id_question_id_key
    ON quiz_responses (attempt_id, question_id);

CREATE UNIQUE INDEX iala_lights_name_lower_key ON iala_lights (lower(name));
CREATE INDEX idx_iala_lights_category ON iala_lights (category);
CREATE INDEX idx_iala_lights_config ON iala_lights USING gin (config);

--------------------------------------------------------------------------------
-- IALA-loisteet
--------------------------------------------------------------------------------

INSERT INTO iala_lights (name, category, rhythm, description, config) VALUES
(
    'Pohjoinen kardinaalimerkki',
    'Kardinaalimerkit',
    'Q tai VQ',
    'Väri: Musta yläosa, keltainen alaosa.
Ylämerkki: Kaksi mustaa ylöspäin osoittavaa kolmiota.
Valotunnus: Jatkuva pikavilkku tai nopea pikavilkkku (Q or VQ).
Yleissääntönä merkki voidaan kiertää turvallisesti merkin pohjoispuolelta.',
    '{
      "color": "white",
      "rhythm": "VQ",
      "sequence_ms": [200, 200]
    }'::jsonb
),
(
    'Eteläinen kardinaalimerkki',
    'Kardinaalimerkit',
    'VQ(6) + LFl 10s',
    'Väri: Keltainen yläosa, musta alaosa.
Ylämerkki: Kaksi mustaa alaspäin osoittavaa kolmiota.
Valotunnus: Kuusi nopeaa väläystä, jonka jälkeen 1 pitkä valo kymmenen sekunnin aikana (VQ(6) + LFl 10s).
Yleissääntönä merkki voidaan kiertää turvallisesti merkin eteläpuolelta.',
    '{
      "color": "white",
      "rhythm": "VQ(6) + LFl 10s",
      "sequence_ms": [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 2000, 5600]
    }'::jsonb
),
(
    'Itäinen kardinaalimerkki',
    'Kardinaalimerkit',
    'VQ(3) 5s',
    'Väri: Musta ylä- ja alaosa, keltainen keskiosa.
Ylämerkki: Kaksi mustaa kolmiota, joista ylemmän kärki osoittaa ylös, ja alemman alas.
Valotunnus: Kolme nopeaa väläystä 5 sekunnin aikana (VQ(3) 5s).
Yleissääntönä merkki voidaan kiertää turvallisesti merkin itäpuolelta.',
    '{
      "color": "white",
      "rhythm": "VQ(3) 5s",
      "sequence_ms": [200, 200, 200, 200, 200, 4000]
    }'::jsonb
),
(
    'Läntinen kardinaalimerkki',
    'Kardinaalimerkit',
    'VQ(9) 10s',
    'Väri: Keltainen ylä- ja alaosa, musta keskiosa.
Ylämerkki: Kaksi mustaa kolmiota, joiden kärjet osoittavat toisiaan päin.
Valotunnus: Yhdeksän nopeaa väläystä 10 sekunnin aikana (VQ(9) 10s).
Yleissääntönä merkki voidaan kiertää turvallisesti merkin länsipuolelta.',
    '{
      "color": "white",
      "rhythm": "VQ(9) 10s",
      "sequence_ms": [200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 200, 6600]
    }'::jsonb
),
(
    'Vasen merkki (A-alue)',
    'Lateraalimerkit',
    'Fl R 3s',
    'Väri: Punainen.
Ylämerkki: Yksi punainen lieriö.
Valotunnus: Punainen valo, yksi väläys kolmen sekunnin aikana(Fl R 3s).
Yleissääntönä IALA A-alueella vasen merkki jätetään aluksen vasemmalle puolelle kuljettaessa satamaa kohti.',
    '{
      "color": "red",
      "rhythm": "Fl R 3s",
      "sequence_ms": [500, 2500]
    }'::jsonb
),
(
    'Oikea merkki (A-alue)',
    'Lateraalimerkit',
    'Fl G 3s',
    'Väri: Vihreä.
Ylämerkki: Yksi vihreä kolmio, joka osoittaa ylös.
Valotunnus: Vihreä valo, yksi väläys kolmen sekunnin aikana(Fl G 3s).
Yleissääntönä IALA A-alueella oikea merkki jätetään aluksen oikealle puolelle kuljettaessa satamaa kohti.',
    '{
      "color": "green",
      "rhythm": "Fl G 3s",
      "sequence_ms": [500, 2500]
    }'::jsonb
),
(
    'Karimerkki',
    'Erikoismerkit',
    'Fl(2) 5s',
    'Väri: Musta yhdellä tai useammalla punaisella raidalla.
Ylämerkki: Kaksi mustaa palloa.
Valotunnus: Kaksi väläystä 5 sekunnin aikana (Fl(2) 5s).
Merkkiä käytetään varoittamaan karista.',
    '{
      "color": "white",
      "rhythm": "Fl(2) 5s",
      "sequence_ms": [500, 500, 500, 3500]
    }'::jsonb
),
(
    'Turvavesimerkki',
    'Erikoismerkit',
    'LFl 10s',
    'Väri: Jaettu pystysuoraan punaiseen ja valkoiseen.
Ylämerkki: Yksi punainen pallo.
Valotunnus: Pitkä kahden sekunnin valo, joka näkyy 10 sekunnin aikana.
Yleissääntönä osoittaa avointa ja turvallista vettä väylän keskellä tai alussa.',
    '{
      "color": "white",
      "rhythm": "LFl 10s",
      "sequence_ms": [2000, 8000]
    }'::jsonb
);

-- Alla oleva lisää testiquizin ja yhden kysymyksen testausta varten. Admin-dashboard olisi parempi tulevaisuutta ajatellen
DO $$
DECLARE
    v_quiz_id UUID;
    v_question_id UUID;
    v_north_id UUID;
    v_south_id UUID;
    v_east_id UUID;

BEGIN
    INSERT INTO quizzes (name) VALUES ('Testiquiz') RETURNING id INTO v_quiz_id;

    SELECT id INTO v_north_id FROM iala_lights WHERE name = 'Pohjoinen kardinaalimerkki';
    SELECT id INTO v_south_id FROM iala_lights WHERE name = 'Eteläinen kardinaalimerkki';
    SELECT id INTO v_east_id FROM iala_lights WHERE name = 'Itäinen kardinaalimerkki';

    INSERT INTO quiz_questions (quiz_id, iala_light_id, question_text, position)
    VALUES (
        v_quiz_id, 
        v_north_id, 
        'Mikä näistä IALA-loisteista on pohjoinen kardinaalimerkki?', 
        1
    ) 
    RETURNING id INTO v_question_id;

    INSERT INTO quiz_question_options (question_id, iala_light_id, option_text, is_correct, position)
    VALUES (v_question_id, v_north_id, 'Vaihtoehto 1', TRUE, 1);

    INSERT INTO quiz_question_options (question_id, iala_light_id, option_text, is_correct, position)
    VALUES (v_question_id, v_south_id, 'Vaihtoehto 2', FALSE, 2);

    INSERT INTO quiz_question_options (question_id, iala_light_id, option_text, is_correct, position)
    VALUES (v_question_id, v_east_id, 'Vaihtoehto 3', FALSE, 3);

END $$;
COMMIT;