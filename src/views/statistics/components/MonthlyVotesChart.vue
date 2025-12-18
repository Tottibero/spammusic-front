<template>
  <div class="w-full h-[320px] sm:h-96">
    <component
      v-if="loaded"
      :is="isMobile ? Bar : Line"
      :data="chartData"
      :options="isMobile ? barOptions : lineOptions"
    />
    <p v-else class="text-center text-white/60">
      Cargando gráfico…
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted } from "vue";
import type { PropType } from "vue";
import { Line, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  BarElement,
  CategoryScale,
  LinearScale
);

export default defineComponent({
  name: "MonthlyVotesChart",
  components: { Line, Bar },
  props: {
    monthlyVotes: {
      type: Array as PropType<{
        month: string;
        count: number;
        weeks: { week: string; count: number }[];
      }[]>,
      required: true,
    },
  },
  setup(props) {
    const loaded = ref(false);
    const isMobile = ref(window.innerWidth < 640);

    /* ---------------------------
     * Resize handling
     * --------------------------- */
    const updateSize = () => {
      isMobile.value = window.innerWidth < 640;
    };

    onMounted(() => {
      window.addEventListener("resize", updateSize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", updateSize);
    });

    /* ---------------------------
     * Chart data
     * --------------------------- */
    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: "Votos",
          data: [] as number[],
          backgroundColor: "#36A2EB",
          borderColor: "#36A2EB",
          borderWidth: 2,
        },
      ],
    });

    /* ---------------------------
     * Desktop → LINE (semanas)
     * --------------------------- */
    const lineOptions = ref<ChartOptions<"line">>({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: "white" },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        x: {
          ticks: {
            color: "white",
            maxRotation: 45,
            minRotation: 45,
          },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
      },
    });

    /* ---------------------------
     * Mobile → BAR horizontal (meses)
     * --------------------------- */
    const barOptions = ref<ChartOptions<"bar">>({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        y: {
          ticks: { color: "white" },
          grid: { display: false },
        },
      },
    });

    /* ---------------------------
     * Data processing
     * --------------------------- */
    watch(
      () => [props.monthlyVotes, isMobile.value],
      () => {
        if (!props.monthlyVotes.length) return;

        if (isMobile.value) {
          // ✅ MÓVIL → solo meses (12 barras)
          chartData.value.labels = props.monthlyVotes.map(m => m.month);
          chartData.value.datasets[0].data = props.monthlyVotes.map(m => m.count);
        } else {
          // ✅ DESKTOP → semanas
          const labels: string[] = [];
          const data: number[] = [];

          props.monthlyVotes.forEach(monthData => {
            const sortedWeeks = [...monthData.weeks].sort(
              (a, b) => Number(a.week) - Number(b.week)
            );

            sortedWeeks.forEach((weekData, index) => {
              labels.push(index === 0 ? monthData.month : "");
              data.push(weekData.count);
            });
          });

          chartData.value.labels = labels;
          chartData.value.datasets[0].data = data;
        }

        loaded.value = true;
      },
      { immediate: true, deep: true }
    );

    return {
      loaded,
      isMobile,
      chartData,
      lineOptions,
      barOptions,
      Line,
      Bar,
    };
  },
});
</script>
