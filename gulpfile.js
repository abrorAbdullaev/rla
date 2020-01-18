var gulp = require('gulp');
var exec = require('child_process').exec;
let watch = require('gulp-watch');

const build = (cb) => {
  console.log('Building...');

  exec('npx webpack', (err, stdErr, stdOut) => {
    console.log(stdOut);
    console.log(stdErr),
    cb(err);
  });

  cb();
}

gulp.task('build', build);

gulp.task('watch', (cb) => {
  watch([
    './src/**/*.ts',
  ], () => {
    build(cb);
  });
})
