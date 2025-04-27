<template>
  <nav class="bg-white/95 backdrop-blur-sm border-b border-gray-100 fixed top-0 left-0 w-full z-20 shadow-sm">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-center items-center h-16">
        <div class="flex space-x-8">
          <router-link 
            to="/" 
            aria-label="Home" 
            class="text-gray-600 hover:text-sky-600 transition-colors duration-200 flex flex-col items-center group relative"
            v-slot="{ isActive }"
          >
            <div class="p-1.5 rounded-lg group-hover:bg-sky-50 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                class="w-5 h-5 mb-0.5 transition-colors duration-200"
                :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">
                <path d="M19.5 10.5V21a1.5 1.5 0 01-1.5 1.5h-4.5v-6h-3v6H6a1.5 1.5 0 01-1.5-1.5V10.5L12 3l7.5 7.5z" />
              </svg>
            </div>
            <span class="text-xs font-medium transition-colors duration-200"
              :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">Home</span>
            <span v-if="isActive" class="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-600 rounded-full"></span>
          </router-link>

          <router-link 
            to="/add-stock" 
            aria-label="Add Stock"
            class="text-gray-600 hover:text-sky-600 transition-colors duration-200 flex flex-col items-center group relative"
            v-slot="{ isActive }"
          >
            <div class="p-1.5 rounded-lg group-hover:bg-sky-50 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                class="w-5 h-5 mb-0.5 transition-colors duration-200"
                :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">
                <path fill-rule="evenodd"
                  d="M12 3.75a.75.75 0 01.75.75v6h6a.75.75 0 110 1.5h-6v6a.75.75 0 11-1.5 0v-6h-6a.75.75 0 110-1.5h6v-6a.75.75 0 01.75-.75z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xs font-medium transition-colors duration-200"
              :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">Add Stock</span>
            <span v-if="isActive" class="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-600 rounded-full"></span>
          </router-link>

          <router-link 
            to="/sold-item" 
            aria-label="Sold Item"
            class="text-gray-600 hover:text-sky-600 transition-colors duration-200 flex flex-col items-center group relative"
            v-slot="{ isActive }"
          >
            <div class="p-1.5 rounded-lg group-hover:bg-sky-50 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                class="w-5 h-5 mb-0.5 transition-colors duration-200"
                :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">
                <path fill-rule="evenodd"
                  d="M12 3.75a.75.75 0 01.75.75v6h6a.75.75 0 110 1.5h-6v6a.75.75 0 11-1.5 0v-6h-6a.75.75 0 110-1.5h6v-6a.75.75 0 01.75-.75zm-1.5 8.25v-6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0zm-6-1.5h6v1.5H6a.75.75 0 010-1.5zm12 0h-6v1.5h6a.75.75 0 010-1.5z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xs font-medium transition-colors duration-200"
              :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">Sold Item</span>
            <span v-if="isActive" class="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-600 rounded-full"></span>
          </router-link>

          <router-link 
            to="/records" 
            aria-label="Records"
            class="text-gray-600 hover:text-sky-600 transition-colors duration-200 flex flex-col items-center group relative"
            v-slot="{ isActive }"
          >
            <div class="p-1.5 rounded-lg group-hover:bg-sky-50 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                class="w-5 h-5 mb-0.5 transition-colors duration-200"
                :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">
                <path fill-rule="evenodd"
                  d="M5.25 4.5A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5h13.5A2.25 2.25 0 0021 17.25V6.75a2.25 2.25 0 00-2.25-2.25H5.25zM4.5 7.5v10.5a.75.75 0 00.75.75h13.5a.75.75 0 00.75-.75V7.5H4.5zm6.75 9a.75.75 0 000-1.5h-3a.75.75 0 000 1.5h3zm7.5-6h-6a.75.75 0 000 1.5h6a.75.75 0 000-1.5z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <span class="text-xs font-medium transition-colors duration-200"
              :class="isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'">Records</span>
            <span v-if="isActive" class="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-600 rounded-full"></span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavigationBar'
}
</script>

<style scoped>
/* Smooth transitions for the navigation */
nav {
  transition: all 0.3s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Active state indicator animation */
.router-link-active span:last-child {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}

/* Improve focus accessibility */
.router-link:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>