import Koa from "koa";
import router from "./routes/routes";
import cors from "@koa/cors";

const app = new Koa();

app.use(cors());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
