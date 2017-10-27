module.exports = {
  progressShow(done, total) {
    let perc = Math.floor((done / total) * 100);

    process.stdout.write(`${perc}% (${done}/${total})\r`);
  },
};
