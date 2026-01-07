<template>
  <div class="w-full h-[360px] sm:h-96">
    <Bar v-if="loaded" :key="isMobile ? 'mobile' : 'desktop'" :data="chartData"
      :options="isMobile ? mobileOptions : desktopOptions" />
    <p v-else class="text-center text-white/60">
      Cargando gráfico…
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted, onUnmounted } from "vue";
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
    const isMobile = ref(window.innerWidth < 40);

    /* -------------------------
     * Resize handling
     * ------------------------- */
    const onResize = () => {
      isMobile.value = window.innerWidth < 640;
    };

    onMounted(() => window.addEventListener("resize", onResize));
    onUnmounted(() => window.removeEventListener("resize", onResize));

    /* -------------------------
     * Palette
     * ------------------------- */
    const palette = [
      "#FF6633", "#FFB399", "#FF33FF", "#FFFF99", "#00B3E6",
      "#E6B333", "#3366E6", "#999966", "#99FF99", "#B34D4D",
      "#80B300", "#809900", "#E6B3B3", "#6680B3", "#66991A",
      "#FF99E6", "#CCFF1A", "#FF1A66", "#E6331A", "#33FFCC",
    ];

    /* -------------------------
     * Data
     * ------------------------- */
    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: "Votos",
          data: [] as number[],
          backgroundColor: [] as string[],
        },
      ],
    });

    /* -------------------------
     * DESKTOP options (igual que antes)
     * ------------------------- */
    const desktopOptions: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 90,
            minRotation: 90,
            color: "white",
          },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
      },
    };

    /* -------------------------
     * MOBILE options (horizontal + aire)
     * ------------------------- */
    const mobileOptions: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      layout: {
        padding: {
          left: 0,
          right: 0,
        },
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: "white",
            precision: 0,
          },
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
        },
        y: {
          ticks: {
            color: "white",
            autoSkip: false,
            padding: 12, // 👈 más aire entre etiquetas
          },
          grid: { display: false },
        },
      },
    };


    /* -------------------------
     * Watch data
     * ------------------------- */
    watch(
      () => props.genreDistribution,
      (data) => {
        if (!data.length) return;

        const labels = data.map(d => d.genre);
        const datasetData = data.map(d => d.count);
        const backgroundColor = data.map((_, i) => palette[i % palette.length]);

        // 🔥 Espaciado SOLO en móvil
        let extraProps = {};
        if (isMobile.value) {
          extraProps = {
            barThickness: 16,
            categoryPercentage: 0.6,
            barPercentage: 0.9,
          };
        }

        // Assign a NEW object to trigger reactivity
        chartData.value = {
          labels,
          datasets: [
            {
              label: "Votos",
              data: datasetData,
              backgroundColor,
              ...extraProps,
            },
          ],
        };

        loaded.value = true;
      },
      { immediate: true, deep: true }
    );

    return {
      chartData,
      desktopOptions,
      mobileOptions,
      isMobile,
      loaded,
    };
  },
});
</script>
