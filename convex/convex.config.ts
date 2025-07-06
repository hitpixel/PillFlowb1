import { defineApp } from "convex/server";
import resend from "@convex-dev/resend/convex.config";
import polar from "@convex-dev/polar/convex.config";

const app = defineApp();
app.use(resend);
app.use(polar);

export default app; 