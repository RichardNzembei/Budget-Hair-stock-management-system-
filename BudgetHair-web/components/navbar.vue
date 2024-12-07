<template>
  <nav class="bg-white p-3 fixed top-0 left-0 w-full z-10 shadow-md">
    <div class="flex justify-center items-center max-w-4xl mx-auto">
      <div class="flex space-x-4">
        <UButton variant="ghost" size="sm" to="/" aria-label="Home"
          class=" text-purple-500 hover:text-red-700 flex flex-col items-center">
          <UIcon name="i-heroicons-home-solid" size="24" class="mb-1" />
          <span class="text-sm">Home</span>
        </UButton>
        <UButton variant="ghost" size="sm" to="/sold-item" aria-label="Add Product"
          class=" text-purple-500 hover:text-red-700 flex flex-col items-center">
          <UIcon name="i-heroicons-minus-circle-solid" size="24" class="mb-1" />
          <span class="text-sm">Sold Item</span>
        </UButton>
        <UButton variant="ghost" size="sm" to="/record-sale" aria-label="Records"
          class=" text-purple-500 hove// Expose the `show` method so it can be called from the parent componentr:text-red-700 flex flex-col items-center">
          <UIcon name="i-heroicons-document-text-solid" size="24" class="mb-1" />
          <span class="text-sm">Records</span>
        </UButton>
      </div>
    </div>
  </nav>
</template>

<script setup>
</script>

<style scoped>
nav {
  font-family: "Poppins", sans-serif;
}
</style>