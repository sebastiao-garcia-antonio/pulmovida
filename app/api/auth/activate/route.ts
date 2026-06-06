import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=TokenAusente", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "pulmo-vida-secret-key-1234");
    const { payload } = await jwtVerify(token, secret);
    
    if (payload.email) {
      await prisma.user.update({
        where: { email: payload.email as string },
        data: { emailVerified: new Date() }
      });
      return NextResponse.redirect(new URL("/login?activated=true", req.url));
    }
    
    return NextResponse.redirect(new URL("/login?error=TokenInvalido", req.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/login?error=TokenExpirado", req.url));
  }
}
