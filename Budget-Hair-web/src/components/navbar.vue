<template>
  <nav class="bg-white p-3 fixed top-0 left-0 w-full z-10 shadow-md">
    <div class="flex justify-center items-center max-w-4xl mx-auto">
      <div class="flex space-x-4">
        <router-link to="/" aria-label="Home" class="text-purple-500 hover:text-red-700 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mb-1">
            <path d="M19.5 10.5V21a1.5 1.5 0 01-1.5 1.5h-4.5v-6h-3v6H6a1.5 1.5 0 01-1.5-1.5V10.5L12 3l7.5 7.5z" />
          </svg>
          <span class="text-sm">Home</span>
        </router-link>
      
        <router-link to="/sold-item" aria-label="Sold Item"
          class="text-purple-500 hover:text-red-700 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mb-1">
            <path fill-rule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6h6a.75.75 0 110 1.5h-6v6a.75.75 0 11-1.5 0v-6h-6a.75.75 0 110-1.5h6v-6a.75.75 0 01.75-.75zm-1.5 8.25v-6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0zm-6-1.5h6v1.5H6a.75.75 0 010-1.5zm12 0h-6v1.5h6a.75.75 0 010-1.5z"
              clip-rule="evenodd" />
          </svg>
          <span class="text-sm">Sold Item</span>
        </router-link>
        <router-link to="/records" aria-label="Records"
          class="text-purple-500 hover:text-red-700 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mb-1">
            <path fill-rule="evenodd"
              d="M5.25 4.5A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25zM4.5 7.5v10.5a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75V7.5H4.5zm6.75 9a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zm7.5-6h-6a.75.75 0 000 1.5h6a.75.75 0 000-1.5z"
              clip-rule="evenodd" />
          </svg>
          <span class="text-sm">Records</span>
        </router-link>

      </div>
    </div>
  </nav>
</template>

<script>

</script>

<style scoped>
nav {
  font-family: "Poppins", sans-serif;
}
</style>
