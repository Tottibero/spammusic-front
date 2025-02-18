<template>
    <div
      v-if="show"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-lg font-semibold mb-4">{{ title }}</h2>
        <input
          v-model="inputValue"
          :type="inputType"
          :placeholder="placeholder"
          class="border p-2 w-full rounded-md"
          @keyup.enter="handleSave"
        />
        <div class="flex justify-end mt-4 space-x-2">
          <button
            @click="handleCancel"
            class="bg-gray-400 text-white px-4 py-2 rounded-md"
          >
            Cancelar
          </button>
          <button
            @click="handleSave"
            class="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from "vue";
  
  export default defineComponent({
    name: "EditModal",
    props: {
      show: {
        type: Boolean,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      modelValue: {
        type: String,
        required: true,
      },
      placeholder: {
        type: String,
        default: "",
      },
      inputType: {
        type: String,
        default: "text",
      },
    },
    emits: ["update:modelValue", "save", "cancel", "update:show"],
    setup(props, { emit }) {
      const inputValue = ref(props.modelValue);
  
      // Se sincroniza el valor interno si la prop cambia
      watch(
        () => props.modelValue,
        (newVal) => {
          inputValue.value = newVal;
        }
      );
  
      const handleSave = () => {
        emit("update:modelValue", inputValue.value);
        emit("save", inputValue.value);
        emit("update:show", false);
      };
  
      const handleCancel = () => {
        inputValue.value = props.modelValue;
        emit("cancel");
        emit("update:show", false);
      };
  
      return {
        inputValue,
        handleSave,
        handleCancel,
      };
    },
  });
  </script>
  