// ReunionTable.vue
<template>
  <div>
    <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
    <ul class="space-y-4">
      <li
        v-for="reunion in reuniones"
        :key="reunion.id"
        class="border border-gray-300 rounded-lg p-4 bg-white shadow-md"
      >
        <div class="flex justify-between items-center">
          <div>
            <button
              @click="$emit('edit', reunion.id)"
              class="mr-5 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <strong class="text-lg">{{ reunion.titulo }}</strong>
            <p class="text-sm text-gray-600">{{ formatDate(reunion.fecha) }}</p>
          </div>
          <button
            @click="togglePoints(reunion.id)"
            class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {{ expandedReunion === reunion.id ? "Ocultar Puntos" : "Ver Puntos" }}
          </button>
        </div>
        <ul v-if="expandedReunion === reunion.id" class="mt-4 space-y-2 border-t border-gray-200 pt-4">
          <li
            v-for="point in reunion.points"
            :key="point.id"
            class="bg-gray-100 p-3 rounded-lg"
          >
            <div class="flex justify-between items-right">
              <div>
                <input class="mr-5" :checked="point.done" type="checkbox" disabled />
                <strong>{{ point.titulo }}</strong>
              </div>
              <button @click="toggleContent(point.id)" class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
                <i :class="expandedPoint === point.id ? 'fa-solid fa-minus' : 'fa-solid fa-plus'"></i>
              </button>
            </div>
            <div v-if="expandedPoint === point.id" class="mt-2 p-2 bg-white border border-gray-300 rounded-lg">
              {{ point.content }}
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    reuniones: Array,
  },
  data() {
    return {
      expandedReunion: null,
      expandedPoint: null,
    };
  },
  methods: {
    togglePoints(reunionId) {
      this.expandedReunion = this.expandedReunion === reunionId ? null : reunionId;
    },
    toggleContent(pointId) {
      this.expandedPoint = this.expandedPoint === pointId ? null : pointId;
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },
};
</script>
