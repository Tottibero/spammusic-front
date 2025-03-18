<template>
    <div v-if="showVotes" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl relative">
        <!-- Increased max-width -->
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
  
        <h2 class="text-xl font-semibold mb-4 text-gray-800">Votos</h2>
  
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Flex container for table and chart -->
          <!-- Table -->
          <div class="w-full md:w-1/2">
            <!-- Adjusted widths for responsiveness -->
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disco
                  </th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Portada
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="vote in votes" :key="vote.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ vote.user.username }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ vote.rate }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ vote.cover }}
                  </td>
                </tr>
                <tr v-if="votes.length === 0">
                  <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">No hay votos disponibles.</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Chart -->
          <div class="w-full md:w-1/2">
            <!-- Adjusted widths for responsiveness -->
            <canvas ref="pieChart" class="w-full h-full"></canvas> <!-- Added class for better sizing -->
          </div>
        </div>
        <div class="mt-6 flex justify-center">
          <button @click="closeModal" class="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted, watch, nextTick } from 'vue';
  import Chart from 'chart.js/auto';
  
  interface Vote {
    id: string;
    user: {
      username: string;
    };
    rate: number;
    cover: number;
  }
  
  export default defineComponent({
    props: {
      votes: {
        type: Array,
        required: true,
      },
      showVotes: {
        type: Boolean,
        required: true,
      },
    },
    emits: ['close'],
    setup(props, { emit }) {
      const pieChart = ref<HTMLCanvasElement | null>(null);
      const chartInstance = ref<Chart | null>(null);
  
      const closeModal = () => {
        emit('close');
      };
  
      // Function to generate color based on rating
      const getColor = (rating: number) => {
        const normalizedRating = Math.max(0, Math.min(10, rating)); // Ensure rating is within 0-10
  
        // Define color stops
        const colorStops = [
          { rating: 0, color: [139, 0, 0] },   // Dark Red
          { rating: 5, color: [255, 255, 0] }, // Yellow
          { rating: 10, color: [0, 128, 0] }   // Green
        ];
  
        // Find the two relevant color stops
          let lowerStop = colorStops[0];
          let upperStop = colorStops[colorStops.length - 1];
  
          for (let i = 0; i < colorStops.length - 1; i++) {
            if (normalizedRating >= colorStops[i].rating && normalizedRating <= colorStops[i + 1].rating) {
              lowerStop = colorStops[i];
              upperStop = colorStops[i + 1];
              break;
            }
          }
  
  
        // Interpolate between the two color stops
        const ratio = (normalizedRating - lowerStop.rating) / (upperStop.rating - lowerStop.rating);
        const red = Math.round(lowerStop.color[0] + ratio * (upperStop.color[0] - lowerStop.color[0]));
        const green = Math.round(lowerStop.color[1] + ratio * (upperStop.color[1] - lowerStop.color[1]));
        const blue = Math.round(lowerStop.color[2] + ratio * (upperStop.color[2] - lowerStop.color[2]));
          return `rgb(${red}, ${green}, ${blue}, 0.7)`; // Return with some transparency
      };
  
  
      const createChart = () => {
        if (!pieChart.value) return;
  
        const rateCounts: { [key: number]: number } = {};
        const coverCounts: { [key: number]: number } = {};
  
        // Count occurrences of each rate and cover value, and round
        props.votes.forEach((vote) => {
          // Only count votes where rate and cover are greater than 0.01 and not null
          if (vote.rate !== null && vote.rate > 0.01) {
            const rate = Math.round(vote.rate);
            rateCounts[rate] = (rateCounts[rate] || 0) + 1;
          }
          if (vote.cover !== null && vote.cover > 0.01) {
             const cover = Math.round(vote.cover);
            coverCounts[cover] = (coverCounts[cover] || 0) + 1;
          }
        });
  
        const rateLabels = Object.keys(rateCounts).sort((a, b) => Number(a) - Number(b));
        const coverLabels = Object.keys(coverCounts).sort((a, b) => Number(a) - Number(b));
        const allLabelsSet = new Set([...rateLabels, ...coverLabels]);
        const allLabels = Array.from(allLabelsSet).sort((a, b) => Number(a) - Number(b));
  
        const rateData = allLabels.map(label => rateCounts[Number(label)] || 0);
        const coverData = allLabels.map(label => coverCounts[Number(label)] || 0);
  
        // Use the getColor function for dynamic colors
          const backgroundColors = allLabels.map(label => getColor(Number(label)));
  
  
        if (chartInstance.value) {
          chartInstance.value.destroy();
        }
  
        chartInstance.value = new Chart(pieChart.value, {
          type: 'pie',
          data: {
            labels: allLabels,
            datasets: [
              {
                label: 'Disco',
                data: rateData,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')), // Adjust transparency for border
                borderWidth: 1,
              },
              {
                label: 'Portada',
                data: coverData,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Distribución de Votos',
              },
              legend: {
                display: true,
                position: 'bottom',
              },
            },
          },
        });
      };
  
      onMounted(() => {
        nextTick(() => {
          createChart();
        });
      });
  
      watch(() => props.votes, () => {
        nextTick(() => {
          createChart();
        });
      }, { deep: true });
  
  
      watch(() => props.showVotes, (newVal) => {
        if (newVal) {
          nextTick(() => {
            createChart();
          });
        } else {
          if (chartInstance.value) {
            chartInstance.value.destroy();
            chartInstance.value = null;
          }
        }
      });
  
      return {
        closeModal,
        pieChart,
      };
    },
  });
  </script>