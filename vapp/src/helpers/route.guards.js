export default {
  beforeRouteEnter (to, _from, next) {
    next(vm => {
      vm.pushAnalyticsEvent('pageview', { page_path: to.fullPath });
    });
  },
}