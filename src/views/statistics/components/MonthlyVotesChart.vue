<template>
  <div class="w-full h-96">
    <Line v-if="loaded" :data="chartData" :options="chartOptions" />
    <p v-else class="text-center text-gray-500">Cargando gráfico...</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import type { PropType } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
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
  CategoryScale,
  LinearScale
);

export default defineComponent({
  name: "MonthlyVotesChart",
  components: { Line },
  props: {
    monthlyVotes: {
      type: Array as PropType<{ month: string; count: number; weeks: { week: string; count: number }[] }[]>,
      required: true,
    },
  },
  setup(props) {
    const loaded = ref(false);
    const pointDetails = ref<{ week: string; month: string }[]>([]);

    const chartData = ref({
      labels: [] as string[],
      datasets: [
        {
          label: 'Votos por Semana',
          backgroundColor: '#36A2EB',
          borderColor: '#36A2EB',
          data: [] as number[],
          fill: false,
          tension: 0.1
        },
      ],
    });

    const chartOptions = ref<ChartOptions<"line">>({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
             color: 'white'
          }
        },
        tooltip: {
            callbacks: {
                title: (tooltipItems) => {
                    const index = tooltipItems[0].dataIndex;
                    const detail = pointDetails.value[index];
                    return detail ? `${detail.month} - Semana ${detail.week}` : '';
                },
                label: function(context) {
                    return `Votos: ${context.parsed.y}`;
                }
            }
        }
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
                color: 'white',
                maxRotation: 45,
                minRotation: 45
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.1)'
            }
        }
      },
    });

    watch(
      () => props.monthlyVotes,
      (newData) => {
        if (newData.length > 0) {
          const labels: string[] = [];
          const dataPoints: number[] = [];
          const details: { week: string; month: string }[] = [];

          newData.forEach(monthData => {
              // Sort weeks numerically if needed, assuming they come as strings "1", "2"...
              const sortedWeeks = [...monthData.weeks].sort((a, b) => Number(a.week) - Number(b.week));
              
              sortedWeeks.forEach((weekData, index) => {
                  // Only show the Month name for the first week of the month
                  const isFirstWeek = index === 0;
                  let label = isFirstWeek ? monthData.month : ''; 
                  
                  labels.push(label);
                  dataPoints.push(weekData.count);
                  details.push({ week: weekData.week, month: monthData.month });
              });
          });

          chartData.value.labels = labels;
          chartData.value.datasets[0].data = dataPoints;
          pointDetails.value = details;
          loaded.value = true;
        }
      },
      { immediate: true, deep: true }
    );

    return { chartData, chartOptions, loaded };
  },
});
</script>
