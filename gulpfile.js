var gulp = require('gulp');
var exec = require('child_process').exec;
let watch = require('gulp-watch');

const build = (cb) => {
  console.log('Building...');

  exec('npx webpack', (err, stdErr, stdOut) => {
    console.log(stdOut);
    console.log(stdErr),
    cb(err);

    console.log('build finished');
  });

  cb();
}

gulp.task('build', build);

gulp.task('watch', (cb) => {
  watch([
    './src/**/*.ts',
    './src/**/*.html'
  ], () => {
    build(cb);
  });
})
