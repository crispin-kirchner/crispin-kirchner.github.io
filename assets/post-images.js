lightbox.option({
    fadeDuration: 0,
    resizeDuration: 50,
    imageFadeDuration: 50,
    disableScrolling: true
});

$("img").each(function() {
  var src = $(this).attr("src");
  var dirname = src.match(/.*\//);
  
  if(dirname != "/images/") {
    return;
  }
  
  var basename = src.replace(/.*\//, "");
  
  $(this).after('<br />' + this.alt);
  $(this).wrap('<a href="' + dirname + "1080/" + basename + '" data-lightbox="slideshow" data-title="' + this.alt + '" />');
});
