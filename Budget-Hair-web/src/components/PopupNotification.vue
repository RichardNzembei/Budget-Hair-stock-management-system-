<template>
    <div v-if="visible" class="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-xs">
            <div class="text-center">
                <h3 class="text-xl font-semibold text-gray-800">{{ message }}</h3>
                <p class="text-sm text-gray-600 mt-2">{{ description }}</p>
                <button @click="close" class="mt-4 px-6 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
const description = ref('');

const show = (msg, desc) => {
    message.value = msg;
    description.value = desc;
    visible.value = true;
};

const close = () => {
    visible.value = false;
};

defineExpose({ show });
</script>