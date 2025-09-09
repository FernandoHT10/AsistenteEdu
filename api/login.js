import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const filePath = path.join(process.cwd(), "data", "users.json");
const SECRET = process.env.JWT_SECRET || "secret_key_dev"; // Defínelo en Vercel

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { email, password } = req.body;

  try {
    const data = await fs.readFile(filePath, "utf-8");
    const users = JSON.parse(data);

    const user = users.find((u) => u.email === email);
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

    // Crear token
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });

    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: "Error del servidor" });
  }
}
