<template>
  <div class="p-6  max-w-[100rem] mx-auto">
    <h1 class="text-3xl font-bold mb-6">Estadísticas</h1>
    
    <div class="grid grid-cols-1 gap-6 text-white">
      <!--  -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg text-center grid grid-cols-4 gap-4">
        <div>
          <h2 class="text-xl font-semibold mb-2">Total de Votos</h2>
          <p class="text-4xl font-bold text-[#fcee21]">{{ totalVotes }}</p>
        </div>
        <div>
          <h2 class="text-xl font-semibold mb-2">Media</h2>
          <p class="text-4xl font-bold text-[#fcee21]">{{ mean }}</p>
        </div>
        <div>
          <h2 class="text-xl font-semibold mb-2">Mediana</h2>
          <p class="text-4xl font-bold text-[#fcee21]">{{ median }}</p>
        </div>
          <div>
          <h2 class="text-xl font-semibold mb-2"> Ranking</h2>
          <p class="text-4xl font-bold text-[#fcee21]">{{ rank }} de {{ totalUsers }}</p>
        </div>
      </div>
      


      <!-- Monthly Chart Card -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">Votos por Mes</h2>
        <div class="w-full overflow-x-auto">
            <div class="min-w-[600px]">
                <MonthlyVotesChart :monthly-votes="votesByMonth" />
            </div>
        </div>
      </div>

            <!-- Genre Chart Card -->
      <div class="bg-gray-800  p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">Votos por Género</h2>
        <div class="w-full overflow-x-auto">
            <div class="min-w-[600px]">
                <GenreBarChart :genre-distribution="votesByGenre" />
            </div>
        </div>
      </div>

            <!-- Score Chart Card -->
      <div class="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">Distribución de Puntuaciones</h2>
        <div class="w-full overflow-x-auto">
            <div class="min-w-[600px]">
                <ScoreDistributionChart :score-distribution="votesByScore" />
            </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { getRatesStats } from '@services/rates/rates';
import GenreBarChart from './components/GenreBarChart.vue';
import ScoreDistributionChart from './components/ScoreDistributionChart.vue';
import MonthlyVotesChart from './components/MonthlyVotesChart.vue';

export default defineComponent({
  name: 'Statistics',
  components: {
    GenreBarChart,
    ScoreDistributionChart,
    MonthlyVotesChart,
  },
  setup() {
    const totalVotes = ref(0);
    const mean = ref("0");
    const median = ref(0);
    const votesByGenre = ref<{ genre: string; count: number }[]>([]);
    const votesByMonth = ref<{ month: string; count: number; weeks: any[] }[]>([]);
    const votesByScore = ref<{ score: number; count: number }[]>([]);
    const rank = ref(0);
    const totalUsers = ref(0);

    const fetchData = async () => {
      try {
        const data = await getRatesStats();
        totalVotes.value = data.totalVotes;
        mean.value = data.mean;
        median.value = data.median;
        rank.value = data.rank;
        totalUsers.value = data.totalUsers;
        votesByGenre.value = data.votesByGenre;
        votesByMonth.value = data.votesByMonth;
        votesByScore.value = data.votesByScore;
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      totalVotes,
      mean,
      median,
      votesByGenre,
      votesByMonth,
      votesByScore,
      rank,
      totalUsers,
    };
  },
});
</script>
