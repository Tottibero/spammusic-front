<template>
  <div class="w-full h-64">
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

// Registrar componentes de Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default defineComponent({
  name: "RatingBarChart",
  components: { Bar },
  props: {
    ratingDistribution: {
      type: Array as PropType<{ rate: number; count: number }[]>,
      required: true,
    },
  },
  setup(props) {
    const loaded = ref(false);

    // Función para asignar colores según el rating
    const getColorForRate = (rate: number) => {
      const colors: { [key: number]: string } = {
        1: "#ff0000", // Rojo intenso
        1.25: "#ff1919",
        1.5: "#ff3333",
        1.75: "#ff4d4d",
        2: "#ff6666", // Rojo más claro
        2.25: "#ff7966",
        2.5: "#ff8c66",
        2.75: "#ff9f66",
        3: "#ff9900", // Naranja
        3.25: "#ffaa33",
        3.5: "#ffbb66",
        3.75: "#ffcc99",
        4: "#ffcc66", // Naranja más claro
        4.25: "#ffd480",
        4.5: "#ffdb99",
        4.75: "#ffe3b3",
        5: "#ffff00", // Amarillo
        5.25: "#e6ff19",
        5.5: "#ccff33",
        5.75: "#b3ff4d",
        6: "#ccff66", // Amarillo más claro
        6.25: "#99ff66",
        6.5: "#66ff66",
        6.75: "#4dff80",
        7: "#66ff66", // Verde claro
        7.25: "#4dff66",
        7.5: "#33ff66",
        7.75: "#19ff66",
        8: "#33cc33", // Verde más intenso
        8.25: "#2eb82e",
        8.5: "#29a329",
        8.75: "#248f24",
        9: "#009900", // Verde aún más intenso
        9.25: "#008800",
        9.5: "#007700",
        9.75: "#006600",
        10: "#006600", // Verde completamente intenso
      };
      return colors[rate] || "#cccccc"; // Color gris si el rate no está definido
    };

    // Datos del gráfico
    const chartData = ref({
      labels: [] as number[],
      datasets: [
        {
          label: "Cantidad de votos",
          backgroundColor: [] as string[], // Los colores se definirán dinámicamente
          data: [] as number[],
        },
      ],
    });

    // Opciones del gráfico
    const chartOptions = ref<ChartOptions<"bar">>({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    });

    // Observa cambios en ratingDistribution y actualiza los datos
    watch(
      () => props.ratingDistribution,
      (newData) => {
        if (newData.length > 0) {
          chartData.value.labels = newData.map((item) => item.rate);
          chartData.value.datasets[0].data = newData.map((item) => item.count);
          chartData.value.datasets[0].backgroundColor = newData.map((item) =>
            getColorForRate(item.rate)
          );
          loaded.value = true; // Solo marcar como cargado cuando hay datos
        }
      },
      { immediate: true, deep: true }
    );

    return { chartData, chartOptions, loaded };
  },
});
</script>

<style scoped>
/* Estilos opcionales */
</style>
