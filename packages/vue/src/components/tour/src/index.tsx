import { defineComponent, reactive, ref } from "vue";

const getType = (val: unknown) => {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
};

export type Step = {
  target: HTMLElement | string;
  content: string;
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
    };

    const closeTour = () => {
      visible.value = false;
    };

    const getStep = () => {
      const rect = getElRect(curStep.value?.target as any);
      position.left = rect.left;
      position.top = rect.top;
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
      return [
        <div
          class="ivy-tour__mask-item"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: `${rect.top}px`,
            backgroundColor: "#ffa",
          }}
        >
          top
        </div>,
        <div
          class="ivy-tour__mask-item"
          style={{
            top: 0,
            right: 0,
            width: `calc(100% - ${rect.right}px)`,
            height: "100%",
            backgroundColor: "#afa",
          }}
        >
          right
        </div>,
        <div
          class="ivy-tour__mask-item"
          style={{
            left: 0,
            bottom: 0,
            width: "100%",
            height: `calc(100% - ${rect.bottom}px)`,
            backgroundColor: "#4fa",
          }}
        >
          bottom
        </div>,
        <div
          class="ivy-tour__mask-item"
          style={{
            top: 0,
            left: 0,
            width: `${rect.left}px`,
            height: "100%",
            backgroundColor: "#9fa",
          }}
        >
          left
        </div>,
      ];
    };

    const renderDialog = () => {
      return [
        <div>{curStep.value?.content}</div>,
        <div>
          <button
            class="ivy-tour__dialog-item"
            v-show={index.value > 0}
            onClick={prevStep}
          >
            上一步
          </button>
          <button
            class="ivy-tour__dialog-item"
            v-show={index.value < props.steps.length - 1}
            onClick={nextStep}
          >
            下一步
          </button>
          <button
            class="ivy-tour__dialog-item"
            v-show={index.value === props.steps.length - 1}
            onClick={closeTour}
          >
            结束
          </button>
        </div>,
      ];
    };

    return () =>
      visible.value ? (
        <div class="ivy-tour">
          <div class="ivy-tour__mask">{renderMask()}</div>
          <div
            class="ivy-tour__dialog"
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
