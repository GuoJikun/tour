export type Step = {
  target: string;
  title: string;
  content?: string;
  allowHtml?: boolean;
};

export type Steps = Step[];
export type DomRect = DOMRect | undefined;

const safeHtml = (html: string) => {
  return html.replace("<", "&gt;").replace(">", "&lt;");
};

export class Tour {
  #options: Steps = [];
  #step: Step | null = null;
  constructor(options: Steps) {
    this.#options = options;
    this.setStep(0);
    const root = this.render();
    document.body.appendChild(root);
  }

  setStep(index: number) {
    this.#step = this.#options[index];
  }
  // 获取目标元素的宽高和位置
  getElementRect(): DomRect {
    const target = document.querySelector(this.#step?.target as string);
    return target?.getBoundingClientRect();
  }

  renderSvg() {
    const rect = this.getElementRect();
    const rightX = (rect?.x as number) + (rect?.width as number);
    const bottomY = (rect?.y as number) + (rect?.height as number);
    const def = `<defs><mask id="ivy-tour-mask"><rect x="0" y="0" width="100%" height="100%" fill="white"></rect><rect x="${rect?.x}" y="${rect?.y}" rx="2" width="${rect?.width}" height="${rect?.height}" fill="black" pointer-events="none"></rect></mask></defs>`;
    const mask = `<rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#ivy-tour-mask)"></rect>`;
    const left = `<rect id="mask-left" x="0" y="0" width="${rect?.x}" height="100%" fill="transparent" pointer-events="auto"></rect>`;
    const top = `<rect id="mask-top" x="0" y="0" width="100%" height="${rect?.top}" fill="transparent"pointer-events="auto"></rect>`;
    const right = `<rect id="mask-right" x="${rightX}" y="0" width="${rect?.right}" height="100%" fill="transparent"pointer-events="auto"></rect>`;
    const bottom = `<rect id="mask-bottom" x="0" y="${bottomY}" width="100%" height="${rect?.bottom}" fill="transparent"pointer-events="auto"></rect>`;
    console.log(rect);
    console.log(left);
    console.log(top);
    console.log(right);
    console.log(bottom);
    return `<svg style="width:100%;height:100%;" xmlns="http://www.w3.org/2000/svg" version="1.1" pointer-events="none">${def}${mask}${left}${top}${right}${bottom}</svg>`;
  }

  render() {
    const svg = this.renderSvg();
    console.log(svg);
    const target = document.createElement("div");
    target.setAttribute("class", "ivy-tour");
    target.setAttribute(
      "style",
      "width: 0;height: 0;position: fixed;top:0;left:0;z-index:900;inset:0;"
    );
    target.innerHTML = `${svg}`;
    return target;
  }
}

export default Tour;
