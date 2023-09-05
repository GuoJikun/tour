import {
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref,
  Teleport,
} from "vue";

const getType = (val: unknown) => {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
};

export type Step = {
  target: HTMLElement | string;
  title: string;
  allowHtmlString: boolean;
  content: string;
  placement?: "top" | "left" | "right" | "bottom";
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
    enableTeleport: {
      type: Boolean,
      default: true,
    },
    teleportTo: {
      type: [String, HTMLElement],
      default: "body",
    },
  },
  setup(props, { expose }) {
    const maskRect = reactive({
      width: "100vw",
      height: "100vh",
    });
    const getTeleportElRect = () => {
      const rect = getElRect(props.teleportTo);
      maskRect.width = rect.width ?? "100vw";
      maskRect.height = rect.height ?? "100vh";
    };
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
      getTeleportElRect();
      const rect = getElRect(curStep.value?.target as any);
      const dialogRect = getDialogRect();

      const _placement = curStep.value?.placement || "top";
      if (_placement === "top") {
        position.left = rect.left - dialogRect.width / 2 + rect.width / 2;
        position.top = rect.top - dialogRect.height - 8;
      } else if (_placement === "right") {
        position.left = rect.right + 8;
        position.top = rect.top - dialogRect.height / 2 + rect.height / 2;
      } else if (_placement === "bottom") {
        position.left = rect.left - dialogRect.width / 2 + rect.width / 2;
        position.top = rect.bottom + 8;
      } else if (_placement === "left") {
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

    const renderMask = () => {
      const rect = getElRect(curStep.value?.target as any);
      console.log(maskRect);
      return [
        <svg
          style={{
            width: `${maskRect.width}px`,
            height: `${maskRect.height}px`,
          }}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
        >
          <defs>
            <mask id="ivy-tour-mask">
              <rect
                x="0"
                y="0"
                width={maskRect.width}
                height={maskRect.height}
                fill="white"
              ></rect>
              <rect
                x={rect.left}
                y={rect.top}
                rx="2"
                width={rect.width}
                height={rect.height}
                fill="black"
                style="transition: all 0.3s"
              ></rect>
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.4)"
            mask="url(#ivy-tour-mask)"
          ></rect>
          <rect
            class="ivy-tour__mask-item"
            fill="transparent"
            pointer-events="auto"
            x="0"
            y="0"
            width="100%"
            height={rect.top}
          ></rect>

          <rect
            class="ivy-tour__mask-item"
            fill="transparent"
            pointer-events="auto"
            x={rect.right}
            y="0"
            height="100%"
            width={`calc(100% - ${rect.right}px)`}
          ></rect>

          <rect
            class="ivy-tour__mask-item"
            fill="transparent"
            pointer-events="auto"
            x="0"
            y={rect.bottom}
            width="100%"
            height={`calc(100% - ${rect.bottom}px)`}
          ></rect>

          <rect
            class="ivy-tour__mask-item"
            fill="transparent"
            pointer-events="auto"
            x="0"
            y="0"
            width={rect.left}
            height="100%"
          ></rect>
        </svg>,
        <div
          style={{
            position: "absolute",
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            transition: "all 0.3s",
          }}
        ></div>,
      ];
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
        <Teleport disabled={!props.enableTeleport} to="body">
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
        </Teleport>
      ) : (
        []
      );
  },
});
