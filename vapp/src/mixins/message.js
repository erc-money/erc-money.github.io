export default {
  methods: {
    notify(msg) {
      this.$message({   
        message: msg,
        position: 'center',
        autoClose: 5,
        closeButton: { text: 'x' },
      });
    },
  },
}
