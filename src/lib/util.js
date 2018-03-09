module.exports = {
  /**
   * Displaying progress.
   *
   * @param {number} done
   * @param {number} total
   */
  progressShow(done, total) {
    const percent = Math.floor((done / total) * 100);

    process.stdout.write(`${percent}% (${done}/${total})\r`);
  },
};
