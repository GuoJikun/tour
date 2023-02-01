import { App } from "vue";
import Tour from "./src/index";
import "./src/index.scss";

Tour.install = (app: App) => {
  app.component("ivy-tour", Tour);
};

export default Tour;
