import { Application } from "express";

export const configureRoutes = (app: Application) => {
  app.use("/auth", require("./api/user"));
};
