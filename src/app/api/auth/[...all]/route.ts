// src/app/api/auth/[...all]/route.ts
// Better Auth uses [...all] not [...nextauth]
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
