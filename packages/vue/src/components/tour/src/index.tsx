import { computed, defineComponent, onMounted, reactive, ref } from "vue";

const getType = (val: unknown) => {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
};

export type Step = {
  target: HTMLElement | string;
  title: string;
  allowHtmlString: boolean;
  content: string;
  placement: "top" | "left" | "right" | "bottom";
};

export type Steps = Array<Step>;

export default defineComponent({
  props: {
    steps: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  setup(props, { expose }) {
    const dialogRef = ref<HTMLElement | null>(null);
    const getDialogRect = () => {
      if (dialogRef.value) {
        return dialogRef.value.getBoundingClientRect();
      }
      return { width: 0, height: 0 };
    };
    const getElRect = (el: HTMLElement | string) => {
      let targetEl: any = el;
      if (getType(el) === "string") {
        targetEl = document.querySelector(el as string);
      }

      if (!targetEl) {
        return;
      }

      return targetEl.getBoundingClientRect() || null;
    };

    const visible = ref(false);
    const index = ref(0);
    const curStep = ref<Step | null>(props.steps[index.value] as Step);
    const position = reactive({
      top: 0,
      left: 0,
    });

    const openTour = () => {
      visible.value = true;
      const tmp = requestAnimationFrame(() => {
        getStep();
        cancelAnimationFrame(tmp);
      });
    };

    const closeTour = () => {
      visible.value = false;
      index.value = 0;
      curStep.value = props.steps[0] as Step;
    };

    const getStep = () => {
      const rect = getElRect(curStep.value?.target as any);
      const dialogRect = getDialogRect();
      let placement = curStep.value?.placement || "top";

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
    };

    const prevStep = () => {
      if (index.value > 0) {
        curStep.value = props.steps[index.value - 1] as Step;
        index.value = index.value - 1;
        getStep();
      }
    };

    const nextStep = () => {
      if (index.value < props.steps.length - 1) {
        curStep.value = props.steps[index.value + 1] as Step;
        index.value = index.value + 1;
        getStep();
      }
    };

    expose({
      open: openTour,
    });
    const client = reactive({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const getPath = (targetRect: DOMRect) => {
      return `M${client.width},0 L0,0 L0,${client.height} L${client.width},${
        client.height
      } L${client.width},0 Z M${targetRect.left},${targetRect.top - 2} h${
        targetRect.width
      } a2,2 0 0 1 2,2 v${targetRect.height} a2,2 0 0 1 -2,2 h-${
        targetRect.width
      } a2,2 0 0 1 -2,-2 v-${targetRect.height} a2,2 0 0 1 2,-2 z`;
    };
    const renderMask = () => {
      const rect = getElRect(curStep.value?.target as any);
      const d = getPath(rect);
      return (
        <svg style="width: 100%;height: 100%">
          <path
            d={d}
            style="fill: rgba(0, 0, 0, 0.5); pointer-events: auto; cursor: auto"
          ></path>
        </svg>
      );
    };

    const renderDialog = () => {
      return [
        <div class="ivy-tour__dialog--body">
          <span>{curStep.value?.title}</span>
          {curStep.value?.allowHtmlString ? (
            <div innerHTML={curStep.value?.content}></div>
          ) : (
            <div>{curStep.value?.content}</div>
          )}
        </div>,
        <div class="ivy-tour__dialog--footer">
          <div class="ivy-tour__dialog--footer-no">
            {props.steps.map((c, i) => {
              if (i === index.value) {
                return (
                  <div class="ivy-tour__dialog--footer-no-item is-active"></div>
                );
              } else {
                return <div class="ivy-tour__dialog--footer-no-item"></div>;
              }
            })}
          </div>
          <div>
            <button
              class="ivy-tour__dialog-btn"
              v-show={index.value > 0}
              onClick={prevStep}
            >
              上一步
            </button>
            <button
              class="ivy-tour__dialog-btn"
              v-show={index.value < props.steps.length - 1}
              onClick={nextStep}
            >
              下一步
            </button>
            <button
              class="ivy-tour__dialog-btn is-finish"
              v-show={index.value === props.steps.length - 1}
              onClick={closeTour}
            >
              结束
            </button>
          </div>
        </div>,
      ];
    };

    return () =>
      visible.value ? (
        <div class="ivy-tour">
          <div class="ivy-tour__mask">{renderMask()}</div>
          <div
            ref={dialogRef}
            class="ivy-tour__dialog"
            data-placement={curStep.value?.placement || "top"}
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            {renderDialog()}
          </div>
        </div>
      ) : (
        []
      );
  },
});
