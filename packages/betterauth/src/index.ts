export { auth } from "./server/auth";
export type { Session, User } from "./server/auth";
export { getServerSession, requireUserWithRole } from "./server/helpers";
export { createBetterAuthClient, authClient } from "./client/index";

