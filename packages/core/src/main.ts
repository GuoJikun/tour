import "./style.css";
import { Tour } from "./index";

document.querySelector("#begin")?.addEventListener("click", () => {
  new Tour([
    {
      target: ".card",
      title: "Step 1",
      content: "This is the first step",
    },
    {
      target: ".card1",
      title: "Step 1",
      content: "This is the first step",
      placement: "top",
    },
    {
      target: ".card2",
      title: "Step 1",
      content: "This is the first step",
    },
  ]);
});
