<template>
  <div 
    v-if="showVotes" 
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <!-- Modal Container con altura máxima de 80% de la pantalla -->
    <div 
      class="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl relative 
             max-h-[80vh] overflow-y-auto"
    >

      <!-- Título -->
      <h2 class="text-xl font-semibold mb-4 text-gray-800">
        Votos de {{ albumName }} - {{ artistName }}
      </h2>

      <!-- Contenedor principal -->
      <div class="flex flex-col md:flex-row gap-4">

        <!-- Table -->
        <div class="w-full md:w-1/2">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col"
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col"
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disco
                </th>
                <th scope="col"
                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                <td colspan="3"
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  No hay votos disponibles.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Chart and Toggle -->
        <div class="w-full md:w-1/2 flex flex-col items-center">
<!-- Switch Disco / Portada -->
<div class="mb-4 flex items-center justify-center space-x-2 bg-gray-200 rounded-full p-1">
  <button
    @click="isRateSelected = true"
    :class="[
      'text-sm font-semibold px-4 py-1 rounded-full transition-all duration-200',
      isRateSelected ? 'bg-gray-700 text-white' : 'text-gray-700 hover:text-black'
    ]"
  >
    Disco
  </button>
  <button
    @click="isRateSelected = false"
    :class="[
      'text-sm font-semibold px-4 py-1 rounded-full transition-all duration-200',
      !isRateSelected ? 'bg-gray-700 text-white' : 'text-gray-700 hover:text-black'
    ]"
  >
    Portada
  </button>
</div>


          <!-- Contenedor con altura fija o máxima para el chart -->
          <div class="relative w-full h-64">
            <canvas 
              ref="pieChart" 
              class="absolute top-0 left-0 w-full h-full"
            ></canvas>
          </div>
        </div>
      </div>

      <!-- Botón de cerrar al final -->
      <div class="mt-6 flex justify-center">
        <button 
  @click="$emit('close')" 
  class="absolute top-3 right-3 text-white hover:text-[#d9e021] bg-gray-700 hover:bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all"
>
  ✖
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
    albumName: {
      type: String,
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const pieChart = ref<HTMLCanvasElement | null>(null);
    const chartInstance = ref<Chart | null>(null);
    // Control whether to show "rate" or "cover" - starts showing rate
    const isRateSelected = ref(true);

    const closeModal = () => {
      emit('close');
    };

    // Function to generate color based on a numeric value (rating or cover)
    const getColor = (value: number) => {
      const normalizedValue = Math.max(0, Math.min(10, value)); // Ensure 0 <= value <= 10

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
        if (normalizedValue >= colorStops[i].rating && normalizedValue <= colorStops[i + 1].rating) {
          lowerStop = colorStops[i];
          upperStop = colorStops[i + 1];
          break;
        }
      }

      // Interpolate between the two color stops
      const ratio = (normalizedValue - lowerStop.rating) / (upperStop.rating - lowerStop.rating);
      const red = Math.round(lowerStop.color[0] + ratio * (upperStop.color[0] - lowerStop.color[0]));
      const green = Math.round(lowerStop.color[1] + ratio * (upperStop.color[1] - lowerStop.color[1]));
      const blue = Math.round(lowerStop.color[2] + ratio * (upperStop.color[2] - lowerStop.color[2]));
      return `rgb(${red}, ${green}, ${blue}, 0.7)`; // Return with some transparency
    };

    const createChart = () => {
      if (!pieChart.value) return;

      // Count occurrences for rate & cover
      const rateCounts: { [key: number]: number } = {};
      const coverCounts: { [key: number]: number } = {};

      props.votes.forEach((vote) => {
        if (vote.rate !== null && vote.rate > 0.01) {
          const roundedRate = Math.round(vote.rate);
          rateCounts[roundedRate] = (rateCounts[roundedRate] || 0) + 1;
        }
        if (vote.cover !== null && vote.cover > 0.01) {
          const roundedCover = Math.round(vote.cover);
          coverCounts[roundedCover] = (coverCounts[roundedCover] || 0) + 1;
        }
      });

      // Determine the labels for each scenario
      const rateLabels = Object.keys(rateCounts).sort((a, b) => Number(a) - Number(b));
      const coverLabels = Object.keys(coverCounts).sort((a, b) => Number(a) - Number(b));

      // Combine them into one set to keep possible shared labels
      const allLabelsSet = new Set([...rateLabels, ...coverLabels]);
      const allLabels = Array.from(allLabelsSet).sort((a, b) => Number(a) - Number(b));

      // Build datasets
      const rateData = allLabels.map((label) => rateCounts[Number(label)] || 0);
      const coverData = allLabels.map((label) => coverCounts[Number(label)] || 0);

      // Colors (use the same function, but based on each label's numeric value)
      const backgroundColors = allLabels.map((label) => getColor(Number(label)));
      const borderColors = backgroundColors.map((color) => color.replace('0.7', '1'));

      // Destroy any existing chart before creating a new one
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      // Decide which data to display based on isRateSelected
      const selectedData = isRateSelected.value ? rateData : coverData;
      const selectedLabel = isRateSelected.value ? 'Disco' : 'Portada';
      const dynamicTitle = isRateSelected.value
        ? 'Distribución de Votos: Disco'
        : 'Distribución de Votos: Portada';
      

      chartInstance.value = new Chart(pieChart.value, {
        type: 'pie',
        data: {
          labels: allLabels,
          datasets: [
            {
              label: selectedLabel,
              data: selectedData,
              backgroundColor: backgroundColors,
              borderColor: borderColors,
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
              text: dynamicTitle,
            },
            legend: {
              display: true,
              position: 'bottom',
            },
          },
        },
      });
    };

    // Create chart when component is mounted
    onMounted(() => {
      nextTick(() => {
        createChart();
      });
    });

    // Rebuild chart whenever votes change
    watch(
      () => props.votes,
      () => {
        nextTick(() => {
          createChart();
        });
      },
      { deep: true }
    );

    // Rebuild chart whenever the modal is reopened
    watch(() => props.showVotes, (newVal) => {
      if (newVal) {
        nextTick(() => {
          createChart();
        });
      } else {
        // Destroy chart on close
        if (chartInstance.value) {
          chartInstance.value.destroy();
          chartInstance.value = null;
        }
      }
    });

    // Rebuild chart whenever toggle changes
    watch(isRateSelected, () => {
      nextTick(() => {
        createChart();
      });
    });

    return {
      closeModal,
      pieChart,
      isRateSelected,
    };
  },
});
</script>
