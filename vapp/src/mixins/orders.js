export default {
  methods: {
    orderHumanStatus(status) {
      return [
        // enum Status { Open, PartiallyCompleted, Completed, Closed }
        'OPEN', 'PARTIAL', 'COMPLETE', 'CLOSED'
      ][parseInt((status || '').toString(), 10)] || 'N/A';
    },
  },
}
