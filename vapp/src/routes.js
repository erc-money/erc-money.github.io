import Market from './components/Market.vue'
import About from './components/About.vue'
import Stats from './components/Stats.vue'

export default [
  { path: '/', name: 'market', component: Market },
  { path: '/about', name: 'about', component: About },
  { path: '/stats', name: 'stats', component: Stats }
]
