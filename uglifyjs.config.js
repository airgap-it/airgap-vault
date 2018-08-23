module.exports = {

  /**
   * mangle: uglify 2's mangle option
   */
  mangle: {
    reserved: [
      'Buffer',
      'BigInteger',
      'Point',
      'ECPubKey',
      'ECKey',
      'sha512_asm',
      'asm',
      'ECPair',
      'HDNode',
      'BigNumber'
    ]
  },

  /**
   * compress: uglify 2's compress option
   */
  compress: {
    toplevel: true,
    pure_getters: true
  }
};