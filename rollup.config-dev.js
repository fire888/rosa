
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
 
export default {
  input:  'www_src/index.js',
  output:{ 
      file: 'www_dist/js/main.min.js',
      format: 'iife',
      sourcemap: 'inline'
  },
  plugins: [
    babel({
         exclude: 'node_modules/**'
    }),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        './node_modules/react/react.js': [
            'cloneElement', 
            'createElement', 
            'PropTypes', 
            'Children', 
            'Component'
          ],
         }
      })
   ]
}

