<template>
  <div class="w-full h-96">
    <Bar v-if="loaded" :data="chartData" :options="chartOptions" />
    <p v-else class="text-center text-gray-500">Cargando gráfico...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import type { PropType } from "vue";
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartOptions,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default defineComponent({
  name: "GenreBarChart",
  components: { Bar },
  props: {
    genreDistribution: {
      type: Array as PropType<{ genre: string; count: number }[]>,
      required: true,
    },
  },
  setup(props) {
    const loaded = ref(false);

    // Generate random colors for genres since we don't have a fixed mapping here
    // Or use a palette. Let's use a nice palette.
    const palette = [
      "#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6", 
      "#E6B333", "#3366E6", "#999966", "#99FF99", "#B34D4D",
      "#80B300", "#809900", "#E6B3B3", "#6680B3", "#66991A", 
      "#FF99E6", "#CCFF1A", "#FF1A66", "#E6331A", "#33FFCC",
      "#66994D", "#B366CC", "#4D8000", "#B33300", "#CC80CC", 
      "#66664D", "#991AFF", "#E666FF", "#4DB3FF", "#1AB399",
      "#E666B3", "#33991A", "#CC9999", "#B3B31A", "#00E680", 
      "#4D8066", "#809980", "#E6FF80", "#1AFF33", "#999933",
      "#FF3380", "#CCCC00", "#66E64D", "#4D80CC", "#9900B3", 
      "#E64D66", "#4DB380", "#FF4D4D", "#99E6E6", "#6666FF"
    ];

    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: 'Votos',
          backgroundColor: [] as string[],
          data: [] as number[],
        },
      ],
    });

    const chartOptions = ref<ChartOptions<"bar">>({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: 'white'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          }
        },
        x: {
            ticks: {
                autoSkip: false,
                maxRotation: 90,
                minRotation: 90,
                color: 'white'
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        }
      },
    });

    watch(
      () => props.genreDistribution,
      (newData) => {
        if (newData.length > 0) {
          chartData.value.labels = newData.map((item) => item.genre);
          chartData.value.datasets[0].data = newData.map((item) => item.count);
          chartData.value.datasets[0].backgroundColor = newData.map((_, index) =>
            palette[index % palette.length]
          );
          loaded.value = true;
        }
      },
      { immediate: true, deep: true }
    );

    return { chartData, chartOptions, loaded };
  },
});
</script>
