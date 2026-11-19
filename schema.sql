CREATE TABLE menfess (
    id SERIAL PRIMARY KEY,
    category VARCHAR(20) NOT NULL DEFAULT 'Lainnya', -- Hasil klasifikasi AI: Asmara, Kampus, Sosial, Lainnya
    content TEXT NOT NULL,
    likes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    menfess_id INT NOT NULL REFERENCES menfess(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
    UNIQUE(menfess_id, token_hash)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    menfess_id INT NOT NULL REFERENCES menfess(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    alias VARCHAR(20) NOT NULL, -- Contoh: Anonim #A
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);