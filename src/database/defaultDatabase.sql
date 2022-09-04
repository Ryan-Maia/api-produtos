CREATE TABLE IF NOT EXISTS pessoa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome VARCHAR(255) NOT NULL,
  usuario VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS registro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NOT NULL,
  tipo INTEGER NOT NULL, -- 0 = Despesa; 1 = Receita
  valor NUMERIC NOT NULL,
  id_pessoa INTEGER NOT NULL,
  id_categoria INTEGER NOT NULL,
  FOREIGN KEY (id_pessoa) REFERENCES pessoa(id),
  FOREIGN KEY (id_categoria) REFERENCES categoria(id)
);

CREATE TABLE IF NOT EXISTS categoria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo VARCHAR(255) NOT NULL UNIQUE
);