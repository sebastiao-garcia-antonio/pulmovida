import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");
  
  if (isAuthRoute) {
    if (isAuthenticated) {
      const tipo = req.auth?.user?.tipo || "paciente";
      return Response.redirect(new URL(`/${tipo}`, nextUrl));
    }
    return;
  }

  const isProtectedRoute = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/medico") || nextUrl.pathname.startsWith("/paciente");

  if (isAuthenticated && (req.auth?.user as any)?.senhaTemporaria) {
    if (nextUrl.pathname !== "/trocar-senha" && !nextUrl.pathname.startsWith("/api/")) {
      return Response.redirect(new URL("/trocar-senha", nextUrl));
    }
    return;
  }

  if (isProtectedRoute && !isAuthenticated) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (isAuthenticated && isProtectedRoute) {
    const tipo = req.auth?.user?.tipo || "paciente";
    if (nextUrl.pathname.startsWith("/admin") && tipo !== "admin") return Response.redirect(new URL(`/${tipo}`, nextUrl));
    if (nextUrl.pathname.startsWith("/medico") && tipo !== "medico") return Response.redirect(new URL(`/${tipo}`, nextUrl));
    if (nextUrl.pathname.startsWith("/paciente") && tipo !== "paciente") return Response.redirect(new URL(`/${tipo}`, nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
