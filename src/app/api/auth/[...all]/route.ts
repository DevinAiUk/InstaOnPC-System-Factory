import { auth } from "@/lib/auth";

const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
export { GET, POST, PUT, DELETE, PATCH };
