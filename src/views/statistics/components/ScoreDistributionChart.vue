<template>
<div class="w-full h-96 flex justify-center min-w-0">
  <Pie v-if="loaded" :data="chartData" :options="chartOptions" />
  <p v-else class="text-center text-gray-500">Cargando gráfico...</p>
</div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import type { PropType } from "vue";
import { Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default defineComponent({
  name: "ScoreDistributionChart",
  components: { Pie },
  props: {
    scoreDistribution: {
      type: Array as PropType<{ score: number; count: number }[]>,
      required: true,
    },
  },
  setup(props) {
    const loaded = ref(false);

    // Palette for scores 0-10 (11 colors) - Distinct & Contrasting
    const palette = [
      "#e6194b", // 0 - Red
      "#3cb44b", // 1 - Green
      "#ffe119", // 2 - Yellow
      "#4363d8", // 3 - Blue
      "#f58231", // 4 - Orange
      "#911eb4", // 5 - Purple
      "#46f0f0", // 6 - Cyan
      "#f032e6", // 7 - Magenta
      "#bcf60c", // 8 - Lime
      "#fabebe", // 9 - Pink
      "#008080", // 10 - Teal
    ];

    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: 'Votos',
          backgroundColor: [] as string[],
          data: [] as number[],
          borderColor: '#1f2937', // Match bg-gray-800
          borderWidth: 2,
        },
      ],
    });

const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

const buildOptions = (): ChartOptions<"pie"> => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: isMobile() ? "bottom" : "right",
      labels: {
        color: "white",
        boxWidth: 10,
        boxHeight: 10,
        padding: 10,
        font: { size: isMobile() ? 10 : 12 },
      },
    },
  },
});

const chartOptions = ref<ChartOptions<"pie">>(buildOptions());

window.addEventListener("resize", () => {
  chartOptions.value = buildOptions();
});


    watch(
      () => props.scoreDistribution,
      (newData) => {
        if (newData.length > 0) {
          // Ensure scores are sorted 0-10
          const sortedData = [...newData].sort((a, b) => a.score - b.score);
          
          chartData.value.labels = sortedData.map((item) => item.score.toString());
          chartData.value.datasets[0].data = sortedData.map((item) => item.count);
          // Map colors based on score value
          chartData.value.datasets[0].backgroundColor = sortedData.map((item) => palette[item.score] || "#cccccc");
          loaded.value = true;
        }
      },
      { immediate: true, deep: true }
    );

    return { chartData, chartOptions, loaded };
  },
});
</script>
