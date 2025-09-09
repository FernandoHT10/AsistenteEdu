import bcrypt from "bcryptjs";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "users.json");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    // Cargar base de datos (archivo JSON)
    let users = [];
    try {
      const data = await fs.readFile(filePath, "utf-8");
      users = JSON.parse(data);
    } catch {}

    // Verificar si ya existe
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({ error: "Usuario ya registrado" });
    }

    // Encriptar contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Guardar nuevo usuario
    const newUser = { id: Date.now(), name, email, password: hashed };
    users.push(newUser);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));

    return res.status(200).json({ message: "Usuario registrado con éxito" });
  } catch (err) {
    return res.status(500).json({ error: "Error del servidor" });
  }
}
