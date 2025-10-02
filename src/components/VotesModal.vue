<template>
  <div
    v-if="showVotes"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <!-- Modal Container con altura máxima de 80% de la pantalla -->
    <div
      class="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-[95%] sm:w-full sm:max-w-3xl relative max-h-[80vh] overflow-y-auto"
    >
      <!-- Título -->
<div class="text-center mb-8">
  <h2 class="mb-2">
    <span class="bg-gray-700 text-white px-4 py-1 rounded-full text-md font-bold">
      VOTOS
    </span>
  </h2>
  <p class="text-lg text-gray-800 mt-2">
    {{ artistName }} – <span class="italic">{{ albumName }}</span>
  </p>
</div>

      <!-- Contenedor principal -->
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Table -->
        <div class="w-full md:w-1/2">
          <table class="min-w-full divide-y divide-gray-200">
            <thead
              class="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider"
            >
              <tr>
                <th
                  class="px-3 py-2 text-center font-semibold border-b border-gray-300"
                >
                  Usuario
                </th>
                <th
                  class="px-3 py-2 text-center font-semibold border-b border-gray-300"
                >
                  Disco
                </th>
                <th
                  class="px-3 py-2 text-center font-semibold border-b border-gray-300"
                >
                  Portada
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="vote in votes" :key="vote.id">
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  <button
                    class="text-blue-600 hover:underline focus:outline-none"
                    @click="openUserModal(vote.user.username, vote.user.id)"
                  >
                    {{ vote.user.username }}
                  </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ vote.rate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ vote.cover }}
                </td>
              </tr>
              <tr v-if="votes.length === 0">
                <td
                  colspan="3"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  No hay votos disponibles.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Chart and Toggle -->
        <div class="w-full md:w-1/2 flex flex-col items-center">
          <!-- Switch Disco / Portada -->
          <div
            class="mb-4 flex items-center justify-center space-x-2 bg-gray-200 rounded-full p-1"
          >
            <button
              @click="isRateSelected = true"
              :class="[
                'text-sm font-semibold px-4 py-1 rounded-full transition-all duration-200',
                isRateSelected
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:text-black',
              ]"
            >
              Disco
            </button>
            <button
              @click="isRateSelected = false"
              :class="[
                'text-sm font-semibold px-4 py-1 rounded-full transition-all duration-200',
                !isRateSelected
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-700 hover:text-black',
              ]"
            >
              Portada
            </button>
          </div>

          <!-- Donut + leyenda envueltos en un div -->
          <div
            class="relative w-full h-56 top-1 flex flex-col items-center justify-center"
          >
            <canvas ref="doughnut" class="w-full h-full"></canvas>
            <!-- Contenedor para leyenda personalizada -->
            <div
              class="flex flex-wrap justify-center gap-x-1 gap-y-1 mt-4 text-xs text-gray-800"
            >
              <div
                v-for="(label, i) in customLegend"
                :key="i"
                class="flex items-center space-x-1"
              >
                <div
                  :style="{ backgroundColor: label.color }"
                  class="w-2.5 h-2.5 rounded-full"
                ></div>
                <span>{{ label.text }}</span>
              </div>
            </div>
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
  <UserModal
    v-if="showUserModal"
    :username="selectedUserName"
    :user-id="selectedUserId"
    @close="showUserModal = false"
  />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, nextTick } from "vue";
import Chart from "chart.js/auto";
import UserModal from '@/components/UserModal.vue'; // ajusta la ruta

interface Vote {
  id: string;
  user: {
    username: string;
    id: string;

  };
  rate: number;
  cover: number;
}

export default defineComponent({
  components: {
    UserModal,
  },

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
  emits: ["close"],
  setup(props, { emit }) {
    const doughnut = ref<HTMLCanvasElement | null>(null);
    const chartInstance = ref<Chart | null>(null);
    let createChartTimeout: ReturnType<typeof setTimeout> | null = null;
    // Control whether to show "rate" or "cover" - starts showing rate
    const isRateSelected = ref(true);

    const closeModal = () => {
      emit("close");
    };

    const customLegend = ref<{ text: string; color: string }[]>([]);

    // Function to generate color based on a numeric value (rating or cover)
    const getColor = (value: number) => {
      const normalizedValue = Math.max(0, Math.min(10, value)); // Ensure 0 <= value <= 10

      // Define color stops
      const colorStops = [
        { rating: 0, color: [139, 0, 0] }, // Dark Red
        { rating: 5, color: [255, 255, 0] }, // Yellow
        { rating: 10, color: [0, 128, 0] }, // Green
      ];

      // Find the two relevant color stops
      let lowerStop = colorStops[0];
      let upperStop = colorStops[colorStops.length - 1];

      for (let i = 0; i < colorStops.length - 1; i++) {
        if (
          normalizedValue >= colorStops[i].rating &&
          normalizedValue <= colorStops[i + 1].rating
        ) {
          lowerStop = colorStops[i];
          upperStop = colorStops[i + 1];
          break;
        }
      }

      // Interpolate between the two color stops
      const ratio =
        (normalizedValue - lowerStop.rating) /
        (upperStop.rating - lowerStop.rating);
      const red = Math.round(
        lowerStop.color[0] + ratio * (upperStop.color[0] - lowerStop.color[0])
      );
      const green = Math.round(
        lowerStop.color[1] + ratio * (upperStop.color[1] - lowerStop.color[1])
      );
      const blue = Math.round(
        lowerStop.color[2] + ratio * (upperStop.color[2] - lowerStop.color[2])
      );
      return `rgb(${red}, ${green}, ${blue}, 0.7)`; // Return with some transparency
    };

    const createChart = () => {
      if (!doughnut.value) return;

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
      const rateLabels = Object.keys(rateCounts).sort(
        (a, b) => Number(a) - Number(b)
      );
      const coverLabels = Object.keys(coverCounts).sort(
        (a, b) => Number(a) - Number(b)
      );

      // Combine them into one set to keep possible shared labels
      const allLabels = Array.from({ length: 10 }, (_, i) => String(i + 1));

      // Build datasets
      const rateData = allLabels.map((label) => rateCounts[Number(label)] || 0);
      const coverData = allLabels.map(
        (label) => coverCounts[Number(label)] || 0
      );

      // Colors (use the same function, but based on each label's numeric value)
      const backgroundColors = allLabels.map((label) =>
        getColor(Number(label))
      );
      const borderColors = backgroundColors.map((color) =>
        color.replace("0.7", "1")
      );

      // Destroy any existing chart before creating a new one
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }

      // Decide which data to display based on isRateSelected
      const selectedData = isRateSelected.value ? rateData : coverData;
      const selectedLabel = isRateSelected.value ? "Votos" : "Votos";
      const dynamicTitle = isRateSelected.value
        ? "Votos en Disco"
        : "Votos en Portada";

      const field = isRateSelected.value ? "rate" : "cover";

      // Aseguramos que hay números válidos
      const validValues = props.votes
        .map((v) => Number(v[field]))
        .filter((n) => !isNaN(n) && n > 0);

      // Calcular media
      const average =
        validValues.length > 0
          ? (
              validValues.reduce((acc, val) => acc + val, 0) /
              validValues.length
            ).toFixed(2)
          : "0.00";

      const centerTextPlugin = {
        id: "centerText",
        beforeDraw: (chart) => {
          const { width, height, ctx } = chart;

          // Protege contra canvas no inicializado
          if (!ctx || typeof ctx.fillText !== "function") return;

          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const numVotes = validValues.length;
          const averageText = average;
          const votesText = `${numVotes} voto${numVotes === 1 ? "" : "s"}`;

          ctx.fillStyle = "#1f2937";
          ctx.font = "bold 22px sans-serif";
          ctx.fillText(averageText, width / 2, height / 2 + 13);

          ctx.font = "normal 11px sans-serif";
          ctx.fillText(votesText, width / 2, height / 2 + 31);
          ctx.restore();
        },
      };

      chartInstance.value = new Chart(doughnut.value, {
        type: "doughnut",
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
              display: false,
              position: "bottom",
              labels: {
                boxWidth: 8,
                boxHeight: 8,
                padding: 8,
                color: "#1f2937",
                font: { size: 11, weight: "regular" },
                usePointStyle: true,
                generateLabels: (chart) => {
                  const data = chart.data;
                  return (
                    data.labels?.map((label, i) => ({
                      text: `${label}`,
                      fillStyle: data.datasets[0].backgroundColor?.[i],
                      strokeStyle: data.datasets[0].borderColor?.[i],
                      lineWidth: 1,
                      index: i,
                    })) ?? []
                  );
                },
              },
            },
          },
        },
        plugins: [centerTextPlugin],
      });
      // ✅ Aquí va esto:
      customLegend.value = allLabels.map((label, i) => ({
        text: `${label}`,
        color: backgroundColors[i],
      }));
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
    watch(
      () => props.showVotes,
      (newVal) => {
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
      }
    );

    // Rebuild chart whenever toggle changes
    watch(isRateSelected, () => {
      if (createChartTimeout) clearTimeout(createChartTimeout);
      createChartTimeout = setTimeout(() => {
        nextTick(() => {
          createChart();
        });
      }, 200); // 200ms de margen de seguridad
    });

    const showUserModal = ref(false);
    const selectedUserName = ref<string>("");
    const selectedUserId = ref<string>("");

    const openUserModal = (username: string, userId: string) => {
      console.log(username, userId);

      selectedUserName.value = username;
      selectedUserId.value = userId;
      showUserModal.value = true;
    };

    return {
      closeModal,
      doughnut,
      isRateSelected,
      createChart,
      customLegend,
      showUserModal,
      selectedUserName,
      selectedUserId,
      openUserModal,
    };
  },
});
</script>
