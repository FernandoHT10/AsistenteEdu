import { promises as fs } from "fs";
import path from "path";
import authenticateToken from "../middleware/auth";

const filePath = path.join(process.cwd(), "data", "users.json");

export default async function handler(req, res) {
  authenticateToken(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { id } = req.query;

    try {
      const data = await fs.readFile(filePath, "utf-8");
      const users = JSON.parse(data);
      const user = users.find(u => u.id === parseInt(id));
      
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // No devolver la contraseña
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (err) {
      res.status(500).json({ error: "Error del servidor" });
    }
  });
}