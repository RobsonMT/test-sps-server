import express from "express";
import routes from "./routes";
import cors from "cors";
import { seedAdmin } from "./database";

const app = express();

app.use(express.json());

app.use(cors());

app.use(routes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

seedAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
  });
});

export default app;
