import express, { Request, Response } from 'express';
import mysql, { RowDataPacket } from 'mysql2';
import cors from 'cors'; // Import modułu CORS
import crypto from 'crypto';

const app = express();

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'otserven',
});

// Ustawienie odpowiednich opcji CORS
const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:3000', // Zmodyfikuj ten adres URL na odpowiedni
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions)); // Użycie modułu CORS

db.connect((err) => {
    if (err) {
      console.error('Błąd połączenia z bazą danych:', err);
    } else {
      console.log('Połączono z bazą danych MySQL');
    }
  });

  // pobieranie accounts
  /*app.get("/accounts", (req, res) => {
    const q = "SELECT * FROM accounts";
    db.query(q, (err, data) => {
      if (err) {
        console.log(err);
        return res.json(err);
      }
      return res.json(data);
    });
  });*/

  // post accounts
  app.post("/accounts", (req, res) => {
    const q = "INSERT INTO accounts(`email`, `name`, `password`) VALUES (?)";
  
    const getHashedPassword = (password: string) => {
      const sha256 = crypto.createHash('sha256');
      const hash = sha256.update(password).digest('base64');
      return hash;
    }

    const values = [
      req.body.email,
      req.body.name,
      getHashedPassword(req.body.password),
    ];
  
    db.query(q, [values], (err, data) => {
      if (err) return res.send(err);
      return res.json(data);
    });
  });

  // post login
  app.post("/login", (req, res) => {
    const { login, password } = req.body;
  const query = "SELECT * FROM accounts WHERE login = ?";
  db.query(query, [login], (err, result: any) => {
    if (err) {
        console.log(err)
      return res.status(500).json({ error: "Błąd serwera" });
    }

    if (Array.isArray(result) && result.length === 0) {
      // Konto o podanym loginie nie istnieje
      return res.status(401).json({ error: "Nieprawidłowy login lub hasło" });
    }

    // Konto o podanym loginie istnieje, sprawdź hasło
    const user = result[0];
    if (user.password !== password) {
      return res.status(401).json({ error: "Nieprawidłowy login lub hasło" });
    }

    // Logowanie powiodło się
    return res.status(200).json({ message: "Logowanie zakończone sukcesem" });
  });
});

app.listen(5000, () => {
  console.log('Serwer działa na porcie 5000');
});
