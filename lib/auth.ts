import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "Qj9sKxY3zRnMv6bFhP2oA7wE8tY1uI0dLcP4fG5jH9kL2mW8nX6cZ5vB3N0mJ7qX1"
console.log("Backend JWT_SECRET (lib/auth.ts):", JWT_SECRET);

export interface JWTPayload {
  userId: number
  email: string
  tipoUsuario: "padre" | "conductor"
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET)
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    console.log("Backend - Verifying token:", token);
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    console.log("Backend - Token decoded:", decoded);
    return decoded
  } catch (error) {
    console.error("Backend - Token verification failed:", error);
    return null
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}
