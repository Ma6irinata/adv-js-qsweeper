var gulp = require("gulp");
var browserify = require("browserify");
var source = require('vinyl-source-stream');
var tsify = require("tsify");
var paths = {
    pages: ['src/*.html']
};

gulp.task("copy-html", function () {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("dist"));
});

gulp.task("compile", function() {
    var tsProjectDirs = ts.createProject('tsconfig.json', { sortOutput: true});
    var tsResult = gulp.src('src/**.ts')
        .pipe(ts(tsProjectDts));
    tsResult.dts
        // .pipe(concat('index.d.ts'))
        .pipe(gulp.dest('dist'));
})

gulp.task("default", ["copy-html"], function () {
    return browserify({
        basedir: '.',
        debug: true,
        entries: ['src/main.ts', 'src/mainfile.ts'],
        cache: {},
        packageCache: {}
    })
    .plugin(tsify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest("dist"));
});