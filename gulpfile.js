var gulp         = require("gulp"),
    sass         = require('gulp-sass'),
    browserSync  = require('browser-sync'),
    concat       = require("gulp-concat"),
    uglyfi       = require("gulp-uglifyjs"),
    cssnano      = require("gulp-cssnano"),
    rename       = require("gulp-rename"),
    delfile      = require("del"),
    imagemin     = require("gulp-imagemin"),
    // pngquant     = require("imagemin-pngquant"),
    cache        = require("gulp-cache"),
    autoPrefixer = require("gulp-autoprefixer"),
    pug          = require('gulp-pug'),
    gutil        = require("gulp-util"),
    gulpCopy    = require('gulp-copy'),
    spritesmith = require('gulp.spritesmith');
    notify = require("gulp-notify");
    babel = require('gulp-babel');

gulp.task("sass", function () {
    return gulp.src([
            'app/sass/main.sass'
        ])
        .pipe(sass())
        .on('error', function(err) {
            const type = err.type || '';
            const message = err.message || '';
            const extract = err.extract || [];
            const line = err.line || '';
            const column = err.column || '';
            gutil.log(gutil.colors.red.bold('[Less error]') +' '+ gutil.colors.bgRed(type) +' ('+ line +':'+ column +')');
            gutil.log(gutil.colors.bold('message:') +' '+ message);
            gutil.log(gutil.colors.bold('codeframe:') +'\n'+ extract.join('\n'));
            this.emit('end');
        })
        .pipe(autoPrefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], { cascade: true }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.stream())
});

gulp.task("css-libs", ['sass'], function () {
    return gulp.src("app/sass/libs.sass")
        .pipe(sass())
        .pipe(cssnano())
        .pipe(rename({suffix:".min"}))
        .pipe(gulp.dest("app/css"));
});

gulp.task("scripts-libs", function () {
   return gulp.src([
      // "app/libs/jquery/dist/jquery.min.js",
      // "app/libs/bootstrap-slider/bootstrap-slider.min.js",
      // "app/libs/bootstrap/dist/js/bootstrap.js",
      // "app/libs/owl.carousel/dist/owl.carousel.min.js",
      // "app/libs/magnific-popup/dist/jquery.magnific-popup.min.js",
      // "app/libs/tooltipster/dist/js/tooltipster.bundle.js",
      // "app/libs/jquery-validation/dist/jquery.validate.js",
      // "app/libs/jquery-mask-plugin/dist/jquery.mask.min.js",
      // "app/libs/select2/dist/js/select2.full.js",
      // "app/libs/mmenu/mmenu/jquery.mmenu.all.js",
      // "app/libs/selectize/dist/js/standalone/selectize.min.js"
   ])
       //.pipe(concat("libs.min.js"))
       //.pipe(uglyfi())
       .pipe(gulp.dest("app/js"));
});



gulp.task("script", function () {
   return gulp.src([
       "app/pages/base.js",
       "app/pages/index/index.js",
       "app/pages/news/news.js"
    ])

       .pipe(concat("common.js"))
       // .pipe(babel({
       //     presets: ['env']
       // }))
       .pipe(gulp.dest("app/js"))
       .pipe(browserSync.stream())
});

gulp.task("browser-sync", function () {
    browserSync({
        server:{
            baseDir: "app"
        },
        notify: false,
        open: false
    });
});

gulp.task("clean", function () {
   return delfile.sync("dist");
});

gulp.task("clear", function () {
    return cache.clearAll();
});

// gulp.task("img", function () {
//     return gulp.src("app/img/**/*")
//         .pipe(gulp.dest("public/index/img"));
// });

gulp.task("img-min", function () {
   return gulp.src("app/img/**/*.jpg")
       .pipe(cache(imagemin({
           interlaced: true,
           progressive: true,
           svgoPlugins: [{removeViewBox: false}],
           une: [pngquant()]
       })))
       .pipe(gulp.dest("dist/img"));
});

gulp.task('sprite', function () {
    var spriteData = gulp.src('app/img/sprite/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.sass',
            imgPath: '../img/sprite.png'
    }));


    var imgStream = spriteData.img
        .pipe(gulp.dest('app/img'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('app/sass'));

    return merge(imgStream, cssStream)
});

gulp.task("pages", function() {
    return gulp.src([
        "app/pages/index/index.pug"
    ])
        .pipe(pug({pretty: true}))  //с переносом pretty: true
        .on('error', notify.onError(function (error) {
            return error
        }))
        .pipe(gulp.dest("./app"))
        .on('error', gutil.log)
        .pipe(browserSync.stream())
});

gulp.task("watch",[ "browser-sync", "css-libs", "script", "scripts-libs", "pages", /*,"img"*/], function () {
    gulp.watch("app/pages/**/*.pug", ['pages']);
    gulp.watch('app/sass/*.sass', ["sass"]);
    gulp.watch('app/sass/libs.sass', ["css-libs"]);//ели подключен новый плагин
    gulp.watch('app/img/**/*', ["img"]);
    gulp.watch("app/**/*.js", ["script"]);

});

gulp.task("build", ["clean", "img-min", "sass", "scripts-libs", 'sprite'], function () {

    var buildCss = gulp.src([
        "app/css/main.css",
        "app/css/libs.min.css"
    ])
        .pipe(gulp.dest("dist/css"));

    var buildFonts = gulp.src("app/fonts/**/*")
        .pipe(gulp.dest("dist/fonts"));

    var buildJs = gulp.src("app/js/**/*")
        .pipe(gulp.dest("dist/js"));

    var buildHtml = gulp.src("app/*.html")
        .pipe(gulp.dest("dist"));
});
