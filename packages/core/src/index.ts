export interface Step {
  target?: string;
  title?: string;
  content?: string;
  allowHtml?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
}

export type Steps = Array<Step>;
export type DomRect = DOMRect | undefined;

const safeHtml = (html: string) => {
  return html.replace("<", "&gt;").replace(">", "&lt;");
};

const defaultOptions: Step = {
  placement: "bottom",
  allowHtml: false,
};

export class Tour {
  private _uid: number = 0;
  private client = {
    width: 0,
    height: 0,
  };
  private currentStep: number = 0;
  #options: Steps = [];
  #step: Step | null = null;
  private $el: HTMLElement;
  constructor(options: Steps) {
    this.client.width = window.innerWidth;
    this.client.height = window.innerHeight;
    console.log(this.client);
    this.#options = options.map((option: Step) => ({
      ...defaultOptions,
      ...option,
    }));
    this.currentStep = 0;
    this.setStep(0);
    this.$el = this.init();
    document.body.appendChild(this.$el);
  }

  setStep(index: number) {
    this.#step = this.#options[index];
  }
  // 获取目标元素的宽高和位置
  getElementRect(): DomRect {
    const target = document.querySelector(this.#step?.target as string);
    return target?.getBoundingClientRect();
  }
  getPath(targetRect: DOMRect) {
    return `M${this.client.width},0 L0,0 L0,${this.client.height} L${
      this.client.width
    },${this.client.height} L${this.client.width},0 Z M${targetRect.left},${
      targetRect.top - 2
    } h${targetRect.width} a2,2 0 0 1 2,2 v${
      targetRect.height
    } a2,2 0 0 1 -2,2 h-${targetRect.width} a2,2 0 0 1 -2,-2 v-${
      targetRect.height
    } a2,2 0 0 1 2,-2 z`;
  }
  renderMask() {
    const rect = this.getElementRect();
    const d = this.getPath(rect as DOMRect);
    return `<div class="ivy-tour__mask">
      <svg style="width: 100%;height: 100%"><path d="${d}" style="fill: rgba(0, 0, 0, 0.5); pointer-events: auto; cursor: auto"></path></svg>
    </div>`;
  }

  handlePrevStep() {
    if (this.currentStep <= 0) return;
    this.currentStep -= 1;
    this.setStep(this.currentStep);
    this.rerender();
  }

  handleNextStep() {
    if (this.currentStep >= this.#options.length - 1) return;
    this.currentStep += 1;
    this.setStep(this.currentStep);
    this.rerender();
  }

  closeTour() {
    console.log("close");
  }
  renderStepBtn() {
    if (this.currentStep === 0 && this.#options.length > 1) {
      return `<button class="ivy-tour-btn is-next">下一步</button>`;
    } else if (this.currentStep === this.#options.length - 1) {
      return `<button class="ivy-tour-btn is-prev">上一步</button><button class="ivy-tour-btn is-finish">结束</button>`;
    } else {
      return `<button class="ivy-tour-btn is-prev">上一步</button><button class="ivy-tour-btn is-next">下一步</button>`;
    }
  }
  renderStep(option: Step) {
    return `<div class="ivy-tour__content" data-placement="${option.placement}"
     style="">
      <div class="ivy-tour-step">
        <div class="ivy-tour__title">${option.title}</div>
        <div class="ivy-tour__description">${option.content}</div>
        <div class="ivy-tour-step__footer">
          <div class="ivy-tour-step__footer-no">
          ${this.#options
            .map((_, i) => {
              if (i === this.currentStep) {
                return `<div class="ivy-tour-step__footer-no-item is-active"></div>`;
              } else {
                return `<div class="ivy-tour-step__footer-no-item"></div>`;
              }
            })
            .join("")}
          </div>
          <div>
            ${this.renderStepBtn()}
          </div>
        </div>
    </div>
    </div>`;
  }
  setContentPosition(target: HTMLElement) {
    const dialog = target.querySelector(".ivy-tour__content") as HTMLElement;
    const rect = this.getElementRect() as DOMRect;

    const placement = this.#step?.placement;
    requestAnimationFrame(() => {
      const dialogRect = dialog.getBoundingClientRect();
      const position = {
        top: 0,
        left: 0,
      };
      if (placement === "top") {
        position.left = rect.left - dialogRect.width / 2 + rect.width / 2;
        position.top = rect.top - dialogRect.height - 8;
      } else if (placement === "right") {
        position.left = rect.right + 8;
        position.top = rect.top - dialogRect.height / 2 + rect.height / 2;
      } else if (placement === "bottom") {
        position.left = rect.left - dialogRect.width / 2 + rect.width / 2;
        position.top = rect.bottom + 8;
      } else if (placement === "left") {
        position.left = rect.left - dialogRect.width - 8;
        position.top = rect.top - dialogRect.height / 2 + rect.height / 2;
      }

      dialog.style.left = `${position.left}px`;
      dialog.style.top = `${position.top}px`;
    });
  }
  bindEvent(target: HTMLElement) {
    target.querySelector(".is-prev")?.addEventListener("click", () => {
      this.handlePrevStep();
    });
    target.querySelector(".is-next")?.addEventListener("click", () => {
      this.handleNextStep();
    });
    target.querySelector(".is-finish")?.addEventListener("click", () => {
      this.$el.remove();
    });
  }
  init() {
    const mask = this.renderMask();
    const step = this.renderStep(this.#step as Step);
    const target = document.createElement("div");
    target.setAttribute("class", "ivy-tour");
    target.setAttribute("id", `ivy-tour-${this._uid++}`);
    const html = `${mask}${step}`;
    target.innerHTML = html;
    this.setContentPosition(target);
    this.bindEvent(target);
    return target;
  }

  rerender() {
    this.$el.remove();
    this.$el = this.init();
    document.body.appendChild(this.$el);
  }
}

export default Tour;
